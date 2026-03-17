

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';

export const useConversations = () => {
  const { user } = useAuthStore();
  const {
    conversations,
    totalUnreadCount,
    unreadCounts,
    getConversations,
    createConversation,
    selectConversation,
    setUnreadMessageCount,
  } = useMessageStore();

  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getConversations();
  }, []);

  const uniqueConversations = useMemo(() => {
    const seen = new Set();
    return conversations.filter(c => {
      if (seen.has(c._id)) return false;
      seen.add(c._id);
      return true;
    });
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return uniqueConversations;
    const q = searchQuery.toLowerCase();
    return uniqueConversations.filter(c =>
      c.otherUser?.username?.toLowerCase().includes(q)
    );
  }, [uniqueConversations, searchQuery]);

  const selectedConversation = useMemo(
    () => uniqueConversations.find(c => c._id === selectedId) ?? null,
    [uniqueConversations, selectedId]
  );

  const handleSelect = useCallback(async (conv) => {
    if (!conv?._id) return;

    setSelectedId(conv._id);

    useMessageStore.setState(state => {
      const counts = { ...state.unreadCounts, [conv._id]: 0 };
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      return { unreadCounts: counts, totalUnreadCount: total };
    });

    try {
      await selectConversation(conv._id);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
    }
  }, [selectConversation]);

  const handleStartConversation = useCallback(async (participantId) => {
    if (!participantId || participantId === user?._id) return null;
    setCreating(true);
    setError(null);
    try {
      const conv = await createConversation(participantId);
      await handleSelect(conv);
      return conv;
    } catch (err) {
      console.error('Failed to create conversation:', err);
      setError('Failed to start conversation');
      return null;
    } finally {
      setCreating(false);
    }
  }, [user?._id, createConversation, handleSelect]);

  return {
    conversations: filteredConversations,
    allConversations: uniqueConversations,
    selectedId,
    selectedConversation,
    searchQuery,
    creating,
    error,
    totalUnreadCount,
    unreadCounts,
    setSearchQuery,
    handleSelect,
    handleStartConversation,
    setSelectedId,
  };
};

