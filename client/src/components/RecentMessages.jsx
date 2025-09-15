import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useAuth, useUser } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);
  const { user } = useUser();
  const { getToken } = useAuth();

  const fetchRecentMessages = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get('/api/user/recent-messages', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        const groupedMessages = data.messages.reduce((acc, message) => {
          const fromUser = message.from_user_id;
          const toUser = message.to_user_id;

          // Skip messages if both sender and receiver are missing
          if (!fromUser || !toUser) return acc;

          // Determine if the message was received or sent
          const isReceived = fromUser?._id !== user.id && fromUser?._id;
          const otherUser = isReceived ? fromUser : toUser;

          const otherUserId = otherUser?._id || otherUser; // fallback if just an ID string

          if (!acc[otherUserId]) {
            acc[otherUserId] = {
              ...message,
              otherUser,
              unreadCount: isReceived && !message.seen ? 1 : 0,
            };
          } else {
            // Update latest message if newer
            if (new Date(message.createdAt) > new Date(acc[otherUserId].createdAt)) {
              acc[otherUserId] = {
                ...message,
                otherUser,
                unreadCount:
                  acc[otherUserId].unreadCount + (isReceived && !message.seen ? 1 : 0),
              };
            } else if (isReceived && !message.seen) {
              acc[otherUserId].unreadCount += 1;
            }
          }

          return acc;
        }, {});

        const sortedMessages = Object.values(groupedMessages).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setMessages(sortedMessages);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecentMessages();
      const interval = setInterval(fetchRecentMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <div className="bg-white max-w-xs mt-4 p-4 rounded-md shadow text-xs text-slate-800">
      <h3 className="font-semibold mb-4">Recent Messages</h3>
      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
        {messages.length > 0 ? (
          messages.map((message) => {
            const otherUser = message.otherUser || { _id: '', full_name: 'User', profile_picture: '/default-avatar.png' };
            const otherUserId = otherUser._id || otherUser; // handle string ID

            return (
              <Link
                to={`/messages/${otherUserId}`}
                key={message._id}
                className="flex items-start gap-2 py-2 hover:bg-slate-100"
              >
                <img
                  src={otherUser.profile_picture || '/default-avatar.png'}
                  alt={otherUser.full_name || 'User'}
                  className="w-8 h-8 rounded-full"
                />
                <div className="w-full">
                  <div className="flex justify-between">
                    <p className="font-medium">{otherUser.full_name || 'User'}</p>
                    <p className="text-[10px] text-slate-400">
                      {moment(message.createdAt).fromNow()}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    {message.isShared && message.originalPostId ? (
                      <p className="text-gray-500 italic truncate">📎 Shared a post</p>
                    ) : message.text ? (
                      <p className="text-gray-500 truncate">{message.text}</p>
                    ) : message.image_urls?.length > 0 || message.media_url ? (
                      <p className="text-gray-500">📷 Media</p>
                    ) : (
                      <p className="text-gray-500 truncate">Message</p>
                    )}

                    {message.to_user_id?._id === user.id && message.unreadCount > 0 && (
                      <span className="bg-indigo-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">
                        {message.unreadCount > 4 ? '4+' : message.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-gray-400 text-center text-[10px] mt-2">
            No recent messages
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentMessages;
