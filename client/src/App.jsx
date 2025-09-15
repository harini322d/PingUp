import React, { useRef, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Feed from './pages/Feed';
import Messages from './pages/Messages';
import ChatBox from './pages/ChatBox';
import Connections from './pages/Connections';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import Layout from './pages/Layout';
import Notification from './components/Notification';

import { fetchUser } from './features/user/userSlice';
import { fetchConnections } from './features/connections/connectionsSlice';
import { addMessage } from './features/messages/messagesSlice';

const App = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);

  const dispatch = useDispatch();

  // Fetch user & connections on login
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        dispatch(fetchUser(token));
        dispatch(fetchConnections(token));
      }
    };
    fetchData();
  }, [user, getToken, dispatch]);

  // Update pathname ref
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // SSE: Listen to real-time messages including shared posts
  useEffect(() => {
    if (user) {
      const eventSource = new EventSource(
        `${import.meta.env.VITE_BASEURL}/api/message/${user.id}`
      );

      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data);

        // If currently in chat with sender, add directly
        if (pathnameRef.current === `/messages/${message.from_user_id._id}`) {
          dispatch(addMessage(message));
        } else {
          // Else show notification for text, image, or shared post
          toast.custom(
            (t) => <Notification t={t} message={message} />,
            { position: 'bottom-right' }
          );
        }
      };

      return () => {
        eventSource.close();
      };
    }
  }, [user, dispatch]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
