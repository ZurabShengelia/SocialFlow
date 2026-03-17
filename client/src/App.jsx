import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useMessageStore } from './store/messageStore';
import { useNotificationStore } from './store/notificationStore';
import { useUserStore } from './store/userStore';
import { initializeSocket, getSocket, socketListeners, socketEmitters, disconnectSocket } from './services/socketService';

const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FeedPage } from './pages/FeedPage';
import { ProfilePage } from './pages/ProfilePage';
import { MessagesPage } from './pages/MessagesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { StoriesPage } from './pages/StoriesPage';
import { ExplorePage } from './pages/ExplorePage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ContactPage } from './pages/ContactPage';
import { GamesPage } from './pages/GamesPage';
import { PostDetailPage } from './pages/PostDetailPage';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  const { token, getMe, user } = useAuthStore();
  const { darkMode } = useThemeStore();
  const { addMessage, incrementUnread, getUnreadMessageCount, setUnreadMessageCount } = useMessageStore();
  const { addNotification, getUnreadCount } = useNotificationStore();

  const routerConfig = {
    future: routerFutureFlags
  };

  const playMessageSound = () => {

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 600;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Sound notification not available');
    }
  };

  useEffect(() => {
    if (token && user?._id) {
      const socket = initializeSocket();

      socketEmitters.setup(user._id);

      setTimeout(() => {
        getMe();
      }, 500);

      const handleMessageReceived = (message) => {
        const store = useMessageStore.getState();
        const { currentConversationId, addMessage: addMsg, markConversationAsRead } = store;

        const senderId = String(message.sender?._id ?? message.sender ?? '');
        const myId = String(user?._id ?? '');

        if (!senderId || !myId || senderId === myId) {
          store.getConversations();
          return;
        }

        addMsg(message);
        store.getConversations();

        const onMessagesPage = window.location.pathname === '/messages';

        if (onMessagesPage && currentConversationId === message.conversationId) {

          markConversationAsRead(message.conversationId).catch(() => {});
        } else {

          store.incrementUnread();
          playMessageSound();
          if (Notification.permission === 'granted') {
            new Notification('New Message', {
              body: message.text || '📎 Media',
              icon: message.sender?.avatar,
            });
          }
        }
      };

      const handleNotification = (notification) => {
        console.log('🔔 Notification received:', notification);

        addNotification(notification);

        if (Notification.permission === 'granted') {
          new Notification('New Notification', {
            body: notification.text || 'You have a new notification',
            icon: notification.sender?.avatar,
            silent: true
          });
        }
      };

      socket.on('message_received', handleMessageReceived);
      socket.on('notification', handleNotification);

      return () => {

        socket.off('message_received', handleMessageReceived);
        socket.off('notification', handleNotification);
      };
    }
  }, [token, user?._id]);

  useEffect(() => {
    if (token) {
      getMe().catch(() => {});
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
    }
  }, [token]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router future={routerFutureFlags}>
      <Routes>
        {}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {}
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <ExplorePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userId?"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stories"
          element={
            <ProtectedRoute>
              <StoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/games"
          element={
            <ProtectedRoute>
              <GamesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post/:postId"
          element={
            <ProtectedRoute>
              <PostDetailPage />
            </ProtectedRoute>
          }
        />

        {}
        <Route path="/" element={<Navigate to={token ? '/feed' : '/login'} />} />
      </Routes>
    </Router>
  );
}
