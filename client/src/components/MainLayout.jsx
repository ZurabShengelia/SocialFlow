import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useThemeStore } from '../store/themeStore';
import { useState, useEffect } from 'react';
import { getSocket } from '../services/socketService';
import { useMessageStore } from '../store/messageStore';

export const MainLayout = ({ children, wide = false }) => {
  const { darkMode } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addTypingToCurrentUser = useMessageStore(state => state.addTypingToCurrentUser);
  const removeTypingToCurrentUser = useMessageStore(state => state.removeTypingToCurrentUser);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !addTypingToCurrentUser || !removeTypingToCurrentUser) return;
    const onType  = ({ senderId }) => addTypingToCurrentUser(senderId);
    const onStop  = ({ senderId }) => removeTypingToCurrentUser(senderId);
    socket.on('user_is_typing', onType);
    socket.on('user_stopped_typing', onStop);
    return () => {
      socket.off('user_is_typing', onType);
      socket.off('user_stopped_typing', onStop);
    };
  }, [addTypingToCurrentUser, removeTypingToCurrentUser]);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-20 lg:ml-64 pt-4 pb-24 md:pb-8">
        {}
        {}
        <div className={`w-full mx-auto px-3 sm:px-4 md:px-6 ${wide ? 'max-w-6xl' : 'max-w-2xl'}`}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

