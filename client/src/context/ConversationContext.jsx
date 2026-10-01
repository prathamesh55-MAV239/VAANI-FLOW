import React, { createContext, useState, useEffect, useCallback } from 'react';
import { conversationService, aiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const ConversationContext = createContext(null);

export function ConversationProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState('idle'); // 'idle' | 'listening' | 'understanding' | 'thinking' | 'responding'
  const [error, setError] = useState(null);

  // Selected language state (defaults to Marathi for judge demo showcase)
  const [inputLanguage, setInputLanguage] = useState('mr');
  const [responseLanguage, setResponseLanguage] = useState('mr');

  // Load all user conversations
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingConversations(true);
    try {
      const res = await conversationService.list();
      if (res.success) {
        setConversations(res.data);
        // If no active conversation, select the first one
        if (res.data.length > 0 && !activeConversationId) {
          selectConversation(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('[ConversationContext] Failed to load conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [isAuthenticated, activeConversationId]);

  // Select and load a conversation by ID
  const selectConversation = useCallback(async (id) => {
    if (!id) return;
    setActiveConversationId(id);
    setIsLoadingMessages(true);
    setError(null);
    try {
      const res = await conversationService.get(id);
      if (res.success) {
        setCurrentConversation(res.data);
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('[ConversationContext] Error loading conversation details:', err);
      setError('Failed to load conversation messages.');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Create a new conversation
  const createConversation = async (title = 'New Conversation') => {
    try {
      const res = await conversationService.create(title);
      if (res.success) {
        setConversations((prev) => [res.data, ...prev]);
        setActiveConversationId(res.data.id);
        setCurrentConversation(res.data);
        setMessages([]);
        return res.data;
      }
    } catch (err) {
      setError('Could not create new conversation.');
      throw err;
    }
  };

  // Rename a conversation
  const renameConversation = async (id, newTitle) => {
    try {
      const res = await conversationService.update(id, newTitle);
      if (res.success) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
        );
        if (currentConversation && currentConversation.id === id) {
          setCurrentConversation((prev) => ({ ...prev, title: newTitle }));
        }
      }
    } catch (err) {
      setError('Failed to rename conversation.');
    }
  };

  // Delete a conversation
  const deleteConversation = async (id) => {
    try {
      const res = await conversationService.delete(id);
      if (res.success) {
        const remaining = conversations.filter((c) => c.id !== id);
        setConversations(remaining);
        if (activeConversationId === id) {
          if (remaining.length > 0) {
            selectConversation(remaining[0].id);
          } else {
            setActiveConversationId(null);
            setCurrentConversation(null);
            setMessages([]);
          }
        }
      }
    } catch (err) {
      setError('Failed to delete conversation.');
    }
  };

  // Send a message (text or speech transcription)
  const sendMessage = async (messageText) => {
    if (!messageText || !messageText.trim()) return null;

    let targetConvId = activeConversationId;

    // If no active conversation, create one on the fly!
    if (!targetConvId) {
      const newConv = await createConversation('New Conversation');
      targetConvId = newConv.id;
    }

    // Optimistic user message insertion
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      conversation_id: targetConvId,
      role: 'user',
      content: messageText.trim(),
      language: inputLanguage,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsGenerating(true);
    setAiStatus('thinking');
    setError(null);

    try {
      const res = await aiService.chat({
        conversationId: targetConvId,
        message: messageText.trim(),
        inputLanguage,
        responseLanguage,
      });

      if (res.success && res.data) {
        setAiStatus('responding');

        const assistantMsg = {
          id: res.data.messageId,
          conversation_id: targetConvId,
          role: 'assistant',
          content: res.data.response,
          translation: res.data.translation,
          language: res.data.language,
          intent: res.data.intent,
          confidence: res.data.confidence,
          created_at: res.data.createdAt || new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Refresh conversation list to get updated titles and timestamps
        loadConversations();

        setTimeout(() => setAiStatus('idle'), 1500);
        return assistantMsg;
      }
    } catch (err) {
      console.error('[SendMessage Error]', err);
      const msg = err.response?.data?.message || 'Something interrupted the conversation. Please try again.';
      setError(msg);
      setAiStatus('idle');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
      setActiveConversationId(null);
    }
  }, [isAuthenticated, loadConversations]);

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        currentConversation,
        activeConversationId,
        messages,
        isLoadingConversations,
        isLoadingMessages,
        isGenerating,
        aiStatus,
        error,
        inputLanguage,
        responseLanguage,
        setInputLanguage,
        setResponseLanguage,
        loadConversations,
        selectConversation,
        createConversation,
        renameConversation,
        deleteConversation,
        sendMessage,
        setError,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export default ConversationContext;
