'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical,
  MessageSquare,
  Users,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  avatar?: string;
  isOwn?: boolean;
}

interface Participant {
  userId: string;
  userName: string;
  avatar?: string;
  isConnected: boolean;
}

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  participants: Participant[];
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  onSendMessage: (message: string) => void;
  roomId: string;
  className?: string;
}

export function ChatOverlay({
  isOpen,
  onClose,
  messages,
  participants,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onSendMessage,
  roomId,
  className = ''
}: ChatOverlayProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(message => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);
  const totalParticipants = participants.length + 1; // +1 for current user

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Chat Panel */}
      <div className="relative w-full max-w-md ml-auto bg-gray-900 border-l border-gray-700 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Chat</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{totalParticipants} participante{totalParticipants !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Room Info */}
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Sala: {roomId}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.keys(messageGroups).length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <div className="text-sm text-gray-400 mb-2">
                Nenhuma mensagem ainda
              </div>
              <div className="text-xs text-gray-500">
                Seja o primeiro a enviar uma mensagem!
              </div>
            </div>
          ) : (
            Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gray-800 px-3 py-1 rounded-full">
                    <span className="text-xs text-gray-400">{date}</span>
                  </div>
                </div>
                
                {/* Messages for this date */}
                <div className="space-y-3">
                  {dateMessages.map((message, index) => {
                    const isOwn = message.userId === currentUserId;
                    const showAvatar = index === 0 || 
                      dateMessages[index - 1].userId !== message.userId;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                          showAvatar ? 'mt-4' : 'mt-1'
                        }`}
                      >
                        {!isOwn && showAvatar && (
                          <Avatar className="w-8 h-8 mr-2">
                            <AvatarImage src={message.avatar} />
                            <AvatarFallback className="bg-gray-600 text-white text-xs">
                              {getInitials(message.userName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        {!isOwn && !showAvatar && (
                          <div className="w-8 mr-2" />
                        )}
                        
                        <div className={`max-w-xs ${isOwn ? 'ml-12' : 'mr-12'}`}>
                          {!isOwn && showAvatar && (
                            <div className="text-xs text-gray-400 mb-1">
                              {message.userName}
                            </div>
                          )}
                          
                          <div
                            className={`px-3 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-white'
                            }`}
                          >
                            <div className="text-sm whitespace-pre-wrap">
                              {message.message}
                            </div>
                            
                            <div className={`flex items-center justify-end mt-1 space-x-1 ${
                              isOwn ? 'text-blue-200' : 'text-gray-400'
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">
                                {formatTime(message.timestamp)}
                              </span>
                              {isOwn && (
                                <CheckCheck className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="px-4 py-2 border-t border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span>Alguém está digitando...</span>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-20"
                maxLength={500}
              />
              
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-gray-400 hover:text-white"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-gray-400 hover:text-white"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Character Counter */}
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <div>
              {newMessage.length}/500
            </div>
            <div className="flex items-center space-x-2">
              <span>Pressione Enter para enviar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

