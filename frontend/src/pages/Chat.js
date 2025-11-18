import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  Package, 
  Clock,
  CheckCheck,
  X,
  ArrowLeft
} from 'lucide-react';

const Chat = () => {
  const { isAuthenticated } = useAuth();
  const { 
    chats, 
    currentChat, 
    messages, 
    loading, 
    sendingMessage, 
    error,
    loadChats,
    loadChat,
    sendMessage,
    markAsRead,
    deleteChat,
    clearError
  } = useChat();
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const messagesEndRef = React.createRef();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    loadChats();
  }, [isAuthenticated, navigate, loadChats]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatSelect = async (chatId) => {
    setSelectedChatId(chatId);
    await loadChat(chatId);
    await markAsRead(chatId);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChatId) return;

    const result = await sendMessage(selectedChatId, messageInput.trim());
    if (result.success) {
      setMessageInput('');
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      await deleteChat(chatId);
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants?.some(p => p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading && chats.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="festive-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{chats.length} conversations</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-600">{error}</p>
              <button onClick={clearError} className="text-red-400 hover:text-red-600">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Chat List */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Chat Items */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No conversations yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Start chatting with sellers about products
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => handleChatSelect(chat._id)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedChatId === chat._id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Product Image */}
                      <img
                        src={chat.product?.images?.[0]?.url || 'https://via.placeholder.com/50x50'}
                        alt={chat.product?.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      
                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900 truncate">
                            {chat.product?.name}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTime(chat.lastMessageAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <p className="text-sm text-gray-600 truncate">
                            {chat.participants?.find(p => p.user?.role === 'seller')?.user?.name}
                          </p>
                        </div>
                        
                        <p className="text-sm text-gray-500 truncate">
                          {chat.lastMessage}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col items-end space-y-1">
                        {chat.unreadCount > 0 && (
                          <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDeleteChat(chat._id, e)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {currentChat ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={currentChat.product?.images?.[0]?.url || 'https://via.placeholder.com/40x40'}
                        alt={currentChat.product?.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {currentChat.product?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {currentChat.participants?.find(p => p.user?.role === 'seller')?.user?.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedChatId(null);
                        loadChats(); // Refresh chat list
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.sender._id === currentChat.participants[0].user._id ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender._id === currentChat.participants[0].user._id
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-orange-500 text-white'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-end space-x-1 mt-1">
                          <span className={`text-xs ${
                            message.sender._id === currentChat.participants[0].user._id
                              ? 'text-gray-500'
                              : 'text-orange-100'
                          }`}>
                            {formatTime(message.createdAt)}
                          </span>
                          {message.sender._id !== currentChat.participants[0].user._id && (
                            <CheckCheck size={12} className="text-orange-100" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-3">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || sendingMessage}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sendingMessage ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose a chat from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
