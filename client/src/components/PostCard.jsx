import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { BadgeCheck, Heart, MessageCircle, Share2, Trash2, X } from 'lucide-react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
  const postWithHashtags =
    post.content?.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>') || '';
  const [likes, setLikes] = useState(post.likes_count || []);
  const [comments, setComments] = useState(post.comments || []);
  const [commentInput, setCommentInput] = useState('');
  const [shareModal, setShareModal] = useState(false);
  const [followers, setFollowers] = useState([]); // store followers/following
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // Like/Unlike
  const handleLike = async () => {
    const alreadyLiked = likes.includes(currentUser._id);
    setLikes((prev) =>
      alreadyLiked ? prev.filter((id) => id !== currentUser._id) : [...prev, currentUser._id]
    );

    try {
      const token = await getToken();
      const { data } = await api.post(
        '/api/post/like',
        { postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) {
        setLikes((prev) =>
          alreadyLiked ? [...prev, currentUser._id] : prev.filter((id) => id !== currentUser._id)
        );
        toast.error(data.message);
      }
    } catch (error) {
      setLikes((prev) =>
        alreadyLiked ? [...prev, currentUser._id] : prev.filter((id) => id !== currentUser._id)
      );
      toast.error(error.message);
    }
  };

  // Add Comment
  const handleComment = async () => {
    if (!commentInput.trim()) return;

    const tempComment = {
      _id: `temp-${Date.now()}`,
      text: commentInput,
      user: currentUser,
    };
    setComments((prev) => [...prev, tempComment]);
    setCommentInput('');

    try {
      const token = await getToken();
      const { data } = await api.post(
        '/api/post/comment',
        { postId: post._id, text: tempComment.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setComments((prev) =>
          prev.map((c) => (c._id === tempComment._id ? data.comment : c))
        );
        toast.success('Comment added');
      } else {
        setComments((prev) => prev.filter((c) => c._id !== tempComment._id));
        toast.error(data.message);
      }
    } catch (error) {
      setComments((prev) => prev.filter((c) => c._id !== tempComment._id));
      toast.error(error.message);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    const originalComments = [...comments];
    setComments((prev) => prev.filter((c) => c._id !== commentId));

    try {
      const token = await getToken();
      const { data } = await api.post(
        '/api/post/delete-comment',
        { postId: post._id, commentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) {
        setComments(originalComments);
        toast.error(data.message);
      } else {
        toast.success('Comment deleted');
      }
    } catch (error) {
      setComments(originalComments);
      toast.error(error.message);
    }
  };

  // Open Share Modal
  const openShareModal = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get('/api/user/followers-following', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        // Deduplicate users by _id
        const combined = [...data.followers, ...data.following];
        const uniqueUsers = Array.from(new Map(combined.map((u) => [u._id, u])).values());
        setFollowers(uniqueUsers);
        setShareModal(true);
      }
    } catch (error) {
      toast.error('Failed to load followers');
    }
  };

  // Share Post
  const handleShare = async (to_user_id) => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        '/api/post/share',
        { postId: post._id, to_user_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Post shared to chat');
        setShareModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4 w-full max-w-4xl">
      {/* User Info */}
      <div
        onClick={() => navigate('/profile/' + post.user._id)}
        className="inline-flex items-center gap-3 cursor-pointer"
      >
        <img src={post.user.profile_picture} alt="" className="w-10 h-10 rounded-full shadow" />
        <div>
          <div className="flex items-center space-x-1">
            <span>{post.user.full_name}</span>
            <BadgeCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-gray-500 text-sm">
            @{post.user.username} • {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div
          className="text-gray-800 text-sm whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: postWithHashtags }}
        />
      )}

      {/* Images */}
      <div className={`grid gap-2 ${post.image_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {post.image_urls.map((img, index) => (
          <img
            key={index}
            src={img}
            className={`w-full object-cover rounded-lg ${post.image_urls.length === 1 ? 'h-auto' : ''}`}
            alt=""
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
        <div className="flex items-center gap-1 cursor-pointer" onClick={handleLike}>
          <Heart
            className={`w-4 h-4 ${likes.includes(currentUser._id) ? 'text-red-500 fill-red-500' : ''}`}
          />
          <span>{likes.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span>{comments.length}</span>
        </div>
        <div className="flex items-center gap-1 cursor-pointer" onClick={openShareModal}>
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </div>
      </div>

      {/* Comment Input */}
      <div className="flex items-center gap-2 mt-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
        />
        <button onClick={handleComment} className="text-blue-500 font-semibold text-sm">
          Post
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-2 mt-2">
        {comments.map((c) => (
          <div key={c._id} className="flex justify-between items-center text-sm text-gray-700">
            <span>
              <span className="font-semibold">{c.user?.full_name || 'User'}: </span>
              {c.text}
            </span>
            {c.user?._id === currentUser._id && (
              <Trash2
                className="w-4 h-4 cursor-pointer text-red-500"
                onClick={() => handleDeleteComment(c._id)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Share Modal using Portal */}
      {shareModal &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-4 w-96">
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <h3 className="font-semibold">Share Post</h3>
                <X className="w-5 h-5 cursor-pointer" onClick={() => setShareModal(false)} />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {followers.length > 0 ? (
                  followers.map((u) => (
                    <div
                      key={u._id} // unique
                      onClick={() => handleShare(u._id)}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <img src={u.profile_picture} alt="" className="w-8 h-8 rounded-full" />
                      <span>{u.full_name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No followers/following to share with.</p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default PostCard;
