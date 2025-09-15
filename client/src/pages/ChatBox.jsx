import React, { useEffect, useRef, useState, useMemo } from "react";
import { ImageIcon, SendHorizonal, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import {
  addMessage,
  fetchMessages,
  resetMessages,
} from "../features/messages/messagesSlice";
import toast from "react-hot-toast";

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages);
  const { userId } = useParams();
  const location = useLocation();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.value);

  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [user, setUser] = useState(null);
  const [sharedPost, setSharedPost] = useState(location.state?.sharedPost || null);

  const messagesEndRef = useRef(null);
  const connections = useSelector((state) => state.connections.connections);

  // Fetch messages
  const fetchUserMessages = async () => {
    try {
      const token = await getToken();
      dispatch(fetchMessages({ token, userId }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Send message
  const sendMessage = async () => {
    try {
      if (!text && images.length === 0 && !sharedPost) return;

      const token = await getToken();

      if (sharedPost) {
        const { data } = await api.post(
          "/api/message/share",
          {
            to_user_id: userId,
            postId: sharedPost._id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.success) {
          setSharedPost(null);
          dispatch(addMessage(data.message));
        } else {
          throw new Error(data.message);
        }
      } else {
        const formData = new FormData();
        formData.append("to_user_id", userId);
        text && formData.append("text", text);
        images.forEach((img) => formData.append("image", img));

        const { data } = await api.post("/api/message/send", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          setText("");
          setImages([]);
          dispatch(addMessage(data.message));
        } else {
          throw new Error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Sorted messages
  const sortedMessages = useMemo(() => {
    return messages
      ?.slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [messages]);

  // Image previews
  const imagePreviews = useMemo(() => images.map((img) => URL.createObjectURL(img)), [images]);

  useEffect(() => {
    return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  // Fetch messages on mount
  useEffect(() => {
    fetchUserMessages();
    return () => dispatch(resetMessages());
  }, [userId]);

  // Get chat user from connections
  useEffect(() => {
    if (connections.length > 0) {
      const u = connections.find((c) => c._id === userId);
      setUser(u);
    }
  }, [connections, userId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-indigo-50">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300">
        <img src={user.profile_picture} alt="" className="w-8 h-8 rounded-full shadow" />
        <div>
          <p className="font-medium">{user.full_name}</p>
          <p className="text-sm text-gray-500 -mt-1.5">@{user.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="p-5 md:px-10 h-full overflow-y-scroll">
        <div className="space-y-4 max-w-4xl mx-auto">
          {sortedMessages?.map((message) => {
            const fromId = typeof message.from_user_id === "object"
              ? message.from_user_id._id
              : message.from_user_id;
            const isOwn = fromId === currentUser._id;

            // For shared posts, use the original post author if exists
            const displayUser = message.isShared && message.originalPostId?.user
              ? message.originalPostId.user
              : message.from_user_id;

            return (
              <div key={message._id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                <div
                  className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow border border-gray-300 ${
                    isOwn ? "rounded-br-none" : "rounded-bl-none"
                  }`}
                >
                  {/* Show profile & username for shared posts */}
                  {message.isShared && displayUser && (
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={displayUser.profile_picture}
                        alt=""
                        className="w-6 h-6 rounded-full border border-gray-300"
                      />
                      <span className="text-xs font-medium text-gray-700">
                        {displayUser.full_name}
                      </span>
                    </div>
                  )}

                  {/* Multiple images */}
                  {message.image_urls?.length > 0 && (
                    <div className={`grid gap-2 ${message.image_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                      {message.image_urls.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="media"
                          className={`w-full object-cover rounded-lg border border-gray-300 ${message.image_urls.length === 1 ? "h-auto" : ""}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Single image */}
                  {message.media_url && !message.image_urls?.length && (
                    <img
                      src={message.media_url}
                      className="w-full max-w-sm rounded-lg mb-1 border border-gray-300"
                      alt="media"
                    />
                  )}

                  {/* Text */}
                  {message.text && <p className="mt-1">{message.text}</p>}
                </div>
              </div>
            );
          })}

          {/* Shared Post Preview */}
          {sharedPost && (
            <div className="flex flex-col items-start">
              <div className="p-3 text-sm max-w-sm bg-white text-slate-800 rounded-lg shadow border border-gray-300 relative">
                {/* User info */}
                {sharedPost.user && (
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={sharedPost.user.profile_picture}
                      alt="profile"
                      className="w-7 h-7 rounded-full border border-gray-300 shadow-sm"
                    />
                    <div>
                      <p className="font-medium text-slate-900">{sharedPost.user.full_name}</p>
                      <p className="text-xs text-gray-600">@{sharedPost.user.username}</p>
                    </div>
                  </div>
                )}

                {/* Post content */}
                {sharedPost.image_urls?.length > 0 && (
                  <div className={`grid gap-2 ${sharedPost.image_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                    {sharedPost.image_urls.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        className={`w-full object-cover rounded-lg border border-gray-300 ${sharedPost.image_urls.length === 1 ? "h-auto" : ""}`}
                        alt="shared media"
                      />
                    ))}
                  </div>
                )}

                {sharedPost.content && <p className="mt-2 text-slate-800">{sharedPost.content}</p>}

                {/* Close button */}
                <button
                  onClick={() => setSharedPost(null)}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4">
        <div className="flex items-center gap-2 p-2 bg-white w-full max-w-4xl mx-auto border border-gray-300 rounded-full shadow mb-5">
          <input
            type="text"
            className="flex-1 outline-none border-none rounded-full px-3 py-1 text-slate-700 placeholder-gray-400"
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            onChange={(e) => setText(e.target.value)}
            value={text}
          />

          {/* Image Upload */}
          <label htmlFor="image" className="relative cursor-pointer">
            {imagePreviews.length > 0 ? (
              <div className="relative flex gap-1">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative">
                    <img src={preview} alt="" className="h-8 rounded border border-gray-300" />
                    <X
                      className="absolute top-0 right-0 w-4 h-4 text-red-500 bg-white rounded-full cursor-pointer"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <ImageIcon className="w-7 h-7 text-gray-400 cursor-pointer" />
            )}
            <input
              type="file"
              id="image"
              accept="image/*"
              hidden
              multiple
              onChange={(e) => setImages([...images, ...Array.from(e.target.files)])}
            />
          </label>

          <button
            onClick={sendMessage}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full"
          >
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
