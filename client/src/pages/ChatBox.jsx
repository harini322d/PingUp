import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ImageIcon, SendHorizonal, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import {
  addMessage,
  fetchMessages,
  resetMessages,
} from '../features/messages/messagesSlice';
import toast from 'react-hot-toast';

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages);
  const { userId } = useParams();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.value);

  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);

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
      if (!text && !image) return;

      const token = await getToken();
      const formData = new FormData();
      formData.append('to_user_id', userId);
      formData.append('text', text);
      image && formData.append('image', image);

      const { data } = await api.post('/api/message/send', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setText('');
        setImage(null);
        dispatch(addMessage(data.message));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Sorted messages
  const sortedMessages = useMemo(() => {
    return messages?.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [messages]);

  // Image preview with cleanup
  const imagePreview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
            const isOwn = message.from_user_id === currentUser._id;
            return (
              <div
                key={message._id}
                className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${
                    isOwn ? 'rounded-br-none' : 'rounded-bl-none'
                  }`}
                >
                  {message.message_type === 'image' && message.media_url && (
                    <img
                      src={message.media_url}
                      className="w-full max-w-sm rounded-lg mb-1"
                      alt=""
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4">
        <div className="flex items-center gap-3 p-2 bg-white w-full max-w-xl mx-auto border border-gray-300 rounded-full shadow mb-5">
          <input
            type="text"
            className="flex-1 outline-none border-none rounded-full px-3 py-1 text-slate-700 placeholder-gray-400"
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            onChange={(e) => setText(e.target.value)}
            value={text}
          />

          <label htmlFor="image" className="relative cursor-pointer">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="" className="h-8 rounded" />
                <X
                  className="absolute top-0 right-0 w-4 h-4 text-red-500 bg-white rounded-full"
                  onClick={() => setImage(null)}
                />
              </>
            ) : (
              <ImageIcon className="w-7 h-7 text-gray-400 cursor-pointer" />
            )}
            <input
              type="file"
              id="image"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
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
