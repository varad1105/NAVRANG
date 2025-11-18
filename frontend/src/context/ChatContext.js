import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Chat context
const ChatContext = createContext();

// Initial state
const initialState = {
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  sendingMessage: false,
  error: null,
  unreadCount: 0
};

// Action types
const CHAT_ACTIONS = {
  CHAT_START: 'CHAT_START',
  CHAT_SUCCESS: 'CHAT_SUCCESS',
  CHAT_FAILURE: 'CHAT_FAILURE',
  CURRENT_CHAT_SUCCESS: 'CURRENT_CHAT_SUCCESS',
  MESSAGES_SUCCESS: 'MESSAGES_SUCCESS',
  MESSAGE_SENT: 'MESSAGE_SENT',
  SEND_MESSAGE_START: 'SEND_MESSAGE_START',
  SEND_MESSAGE_FAILURE: 'SEND_MESSAGE_FAILURE',
  MARK_READ_SUCCESS: 'MARK_READ_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case CHAT_ACTIONS.CHAT_START:
    case CHAT_ACTIONS.SEND_MESSAGE_START:
      return {
        ...state,
        loading: true,
        sendingMessage: action.type === CHAT_ACTIONS.SEND_MESSAGE_START,
        error: null
      };

    case CHAT_ACTIONS.CHAT_SUCCESS:
      return {
        ...state,
        chats: action.payload,
        loading: false,
        error: null
      };

    case CHAT_ACTIONS.CURRENT_CHAT_SUCCESS:
      return {
        ...state,
        currentChat: action.payload.chat,
        messages: action.payload.messages,
        loading: false,
        error: null
      };

    case CHAT_ACTIONS.MESSAGES_SUCCESS:
      return {
        ...state,
        messages: action.payload,
        loading: false,
        error: null
      };

    case CHAT_ACTIONS.MESSAGE_SENT:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        sendingMessage: false,
        error: null
      };

    case CHAT_ACTIONS.MARK_READ_SUCCESS:
      return {
        ...state,
        unreadCount: Math.max(0, state.unreadCount - action.payload),
        error: null
      };

    case CHAT_ACTIONS.CHAT_FAILURE:
    case CHAT_ACTIONS.SEND_MESSAGE_FAILURE:
      return {
        ...state,
        loading: false,
        sendingMessage: false,
        error: action.payload
      };

    case CHAT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Chat provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { api, isAuthenticated } = useAuth();

  // Load chats
  const loadChats = useCallback(async () => {
    try {
      dispatch({ type: CHAT_ACTIONS.CHAT_START });
      const response = await api.get('/chat');
      dispatch({
        type: CHAT_ACTIONS.CHAT_SUCCESS,
        payload: response.data.data.chats
      });
      
      // Calculate total unread count
      const totalUnread = response.data.data.chats.reduce((total, chat) => {
        return total + (chat.getUnreadCount ? chat.getUnreadCount(api.defaults.headers.common['x-user-id']) : 0);
      }, 0);
      
      return { success: true, unreadCount: totalUnread };
    } catch (error) {
      dispatch({
        type: CHAT_ACTIONS.CHAT_FAILURE,
        payload: error.response?.data?.message || 'Failed to load chats'
      });
      return { success: false, error: error.response?.data?.message || 'Failed to load chats' };
    }
  }, [api]);

  // Load chats on auth state change
  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
    } else {
      dispatch({ type: CHAT_ACTIONS.CHAT_SUCCESS, payload: [] });
      dispatch({ type: CHAT_ACTIONS.CURRENT_CHAT_SUCCESS, payload: { chat: null, messages: [] } });
    }
  }, [isAuthenticated, loadChats]);

  // Start or get existing chat
  const startChat = useCallback(async (productId, sellerId) => {
    try {
      dispatch({ type: CHAT_ACTIONS.CHAT_START });
      const response = await api.post('/chat', { productId, sellerId });
      
      // Refresh chats list
      await loadChats();
      
      return { success: true, chat: response.data.data.chat };
    } catch (error) {
      dispatch({
        type: CHAT_ACTIONS.CHAT_FAILURE,
        payload: error.response?.data?.message || 'Failed to start chat'
      });
      return { success: false, error: error.response?.data?.message || 'Failed to start chat' };
    }
  }, [api, loadChats]);

  // Load chat details and messages
  const loadChat = useCallback(async (chatId) => {
    try {
      dispatch({ type: CHAT_ACTIONS.CHAT_START });
      const response = await api.get(`/chat/${chatId}`);
      dispatch({
        type: CHAT_ACTIONS.CURRENT_CHAT_SUCCESS,
        payload: {
          chat: response.data.data.chat,
          messages: response.data.data.messages
        }
      });
      return { success: true };
    } catch (error) {
      dispatch({
        type: CHAT_ACTIONS.CHAT_FAILURE,
        payload: error.response?.data?.message || 'Failed to load chat'
      });
      return { success: false, error: error.response?.data?.message || 'Failed to load chat' };
    }
  }, [api]);

  // Send message
  const sendMessage = useCallback(async (chatId, content, type = 'text') => {
    try {
      dispatch({ type: CHAT_ACTIONS.SEND_MESSAGE_START });
      const response = await api.post(`/chat/${chatId}/messages`, { content, type });
      
      dispatch({
        type: CHAT_ACTIONS.MESSAGE_SENT,
        payload: response.data.data.message
      });
      
      return { success: true };
    } catch (error) {
      dispatch({
        type: CHAT_ACTIONS.SEND_MESSAGE_FAILURE,
        payload: error.response?.data?.message || 'Failed to send message'
      });
      return { success: false, error: error.response?.data?.message || 'Failed to send message' };
    }
  }, [api]);

  // Mark chat as read
  const markAsRead = async (chatId) => {
    try {
      const response = await api.put(`/chat/${chatId}/read`);
      dispatch({
        type: CHAT_ACTIONS.MARK_READ_SUCCESS,
        payload: response.data.data.unreadCount || 0
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to mark as read' };
    }
  };

  // Delete chat
  const deleteChat = async (chatId) => {
    try {
      await api.delete(`/chat/${chatId}`);
      
      // Remove from local state
      dispatch({
        type: CHAT_ACTIONS.CHAT_SUCCESS,
        payload: state.chats.filter(chat => chat._id !== chatId)
      });
      
      if (state.currentChat?._id === chatId) {
        dispatch({
          type: CHAT_ACTIONS.CURRENT_CHAT_SUCCESS,
          payload: { chat: null, messages: [] }
        });
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete chat' };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    loadChats,
    startChat,
    loadChat,
    sendMessage,
    markAsRead,
    deleteChat,
    clearError
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
