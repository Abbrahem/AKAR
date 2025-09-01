import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  PaperAirplaneIcon,
  PhotoIcon,
  FaceSmileIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import io from 'socket.io-client';

const Chat = () => {
  const { propertyId, userId } = useParams();
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join', user._id);

    newSocket.on('receive_message', (data) => {
      queryClient.invalidateQueries(['messages', propertyId, userId]);
    });

    return () => newSocket.close();
  }, [user._id, propertyId, userId, queryClient]);

  // Fetch conversations
  const { data: conversations } = useQuery(
    ['conversations'],
    () => axios.get('/chat/conversations').then(res => res.data.conversations),
    { enabled: !propertyId || !userId }
  );

  // Fetch messages for specific conversation
  const { data: messagesData, isLoading } = useQuery(
    ['messages', propertyId, userId],
    () => axios.get(`/chat/${propertyId}/${userId}`).then(res => res.data),
    { 
      enabled: !!(propertyId && userId),
      refetchInterval: 5000 // Refetch every 5 seconds
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    (messageData) => axios.post('/chat/send', messageData),
    {
      onSuccess: () => {
        setMessage('');
        queryClient.invalidateQueries(['messages', propertyId, userId]);
        queryClient.invalidateQueries(['conversations']);
      }
    }
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !propertyId || !userId) return;

    const messageData = {
      receiver: userId,
      property: propertyId,
      content: message.trim(),
      messageType: 'text'
    };

    // Emit to socket for real-time delivery
    if (socket) {
      socket.emit('send_message', {
        ...messageData,
        sender: user._id,
        receiverId: userId
      });
    }

    sendMessageMutation.mutate(messageData);
  };

  const renderConversationsList = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">المحادثات</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations?.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>لا توجد محادثات</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations?.map((conversation) => (
              <a
                key={`${conversation.property._id}-${conversation.otherParticipant._id}`}
                href={`/chat/${conversation.property._id}/${conversation.otherParticipant._id}`}
                className="block p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary-700">
                      {conversation.otherParticipant.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.otherParticipant.name}
                      </p>
                      <p className="text-xs text-gray-500 flex-shrink-0 mr-2">
                        {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                          addSuffix: true,
                          locale: ar
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.property.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderChatInterface = () => {
    if (!propertyId || !userId) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <p>اختر محادثة لبدء المراسلة</p>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Back Button - Mobile Only */}
            <button
              onClick={() => navigate('/chat')}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-primary-700">
                {messagesData?.messages?.[0]?.receiver?.name?.charAt(0)?.toUpperCase() ||
                 messagesData?.messages?.[0]?.sender?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {messagesData?.messages?.[0]?.receiver?._id === user._id 
                  ? messagesData?.messages?.[0]?.sender?.name 
                  : messagesData?.messages?.[0]?.receiver?.name}
              </h3>
              <p className="text-sm text-gray-500">متصل</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            messagesData?.messages?.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender._id === user._id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender._id === user._id ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {formatDistanceToNow(new Date(msg.createdAt), {
                      addSuffix: true,
                      locale: ar
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 flex-shrink-0"
            >
              <PhotoIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 flex-shrink-0"
            >
              <FaceSmileIcon className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك..."
              className="flex-1 input"
            />
            <button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isLoading}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-white flex">
      {/* Conversations Sidebar - Hidden on mobile when in chat */}
      <div className={`w-80 border-r border-gray-200 bg-gray-50 ${
        propertyId && userId ? 'hidden md:block' : 'block'
      }`}>
        {renderConversationsList()}
      </div>

      {/* Chat Interface - Full width on mobile when in chat */}
      <div className={`flex-1 ${
        propertyId && userId ? 'block' : 'hidden md:block'
      }`}>
        {renderChatInterface()}
      </div>
    </div>
  );
};

export default Chat;
