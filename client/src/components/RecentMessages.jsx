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
        // Group by sender & take latest message
        const groupedMessages = data.messages.reduce((acc, message) => {
          const senderId = message.from_user_id._id;
          if (
            !acc[senderId] ||
            new Date(message.createdAt) > new Date(acc[senderId].createdAt)
          ) {
            acc[senderId] = message;
          }
          return acc;
        }, {});

        // Sort latest first
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
      const interval = setInterval(fetchRecentMessages, 30000); // refresh every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <div className="bg-white max-w-xs mt-4 p-4 rounded-md shadow text-xs text-slate-800">
      <h3 className="font-semibold mb-4">Recent Messages</h3>
      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
        {messages.map((message) => (
          <Link
            to={`/messages/${message.from_user_id._id}`}
            key={message._id}
            className="flex items-start gap-2 py-2 hover:bg-slate-100"
          >
            <img
              src={message.from_user_id.profile_picture}
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <div className="w-full">
              <div className="flex justify-between">
                <p className="font-medium">{message.from_user_id.full_name}</p>
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

                {!message.seen && (
                  <span className="bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]">
                    1
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}

        {messages.length === 0 && (
          <p className="text-gray-400 text-center text-[10px] mt-2">
            No recent messages
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentMessages;
