'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Settings, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Volume2,
  VolumeX,
  MoreVertical,
  UserCircle,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface Participant {
  userId: string;
  userName: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  avatar?: string;
  isConnected: boolean;
  joinedAt?: Date;
}

interface SidebarMenuProps {
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  participants: Participant[];
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
  localVideoRef?: React.RefObject<HTMLVideoElement>;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  roomId: string;
  className?: string;
}

export function SidebarMenu({
  currentUserId,
  currentUserName,
  currentUserAvatar,
  participants,
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onOpenChat,
  onOpenSettings,
  localVideoRef,
  connectionStatus,
  roomId,
  className = ''
}: SidebarMenuProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const miniVideoRef = useRef<HTMLVideoElement>(null);

  // Copy local video stream to mini video
  useEffect(() => {
    if (localVideoRef?.current && miniVideoRef.current) {
      const localVideo = localVideoRef.current;
      const miniVideo = miniVideoRef.current;
      
      if (localVideo.srcObject) {
        miniVideo.srcObject = localVideo.srcObject;
      }
    }
  }, [localVideoRef, isVideoEnabled]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatJoinTime = (joinedAt?: Date) => {
    if (!joinedAt) return '';
    const now = new Date();
    const diff = now.getTime() - joinedAt.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <Wifi className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const totalParticipants = participants.length + 1; // +1 for current user

  return (
    <div className={`bg-gray-900 border-r border-gray-700 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-80'
    } ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'hidden' : ''}`}>
            <div className="flex items-center space-x-2">
              {getConnectionIcon()}
              <span className="text-sm text-gray-400">
                {connectionStatus === 'connected' ? 'Conectado' : 
                 connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
              </span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
        
        {!isCollapsed && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Sala: {roomId}
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white">
                {totalParticipants} participante{totalParticipants !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Current User Section */}
      <div className="p-4 border-b border-gray-700">
        <div className={`${isCollapsed ? 'flex flex-col items-center space-y-2' : 'space-y-3'}`}>
          {/* Mini Video */}
          <div className={`relative ${isCollapsed ? 'w-12 h-12' : 'w-full h-32'} bg-gray-800 rounded-lg overflow-hidden`}>
            {isVideoEnabled ? (
              <video
                ref={miniVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Avatar className={isCollapsed ? 'w-8 h-8' : 'w-16 h-16'}>
                  <AvatarImage src={currentUserAvatar} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(currentUserName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            
            {/* Status indicators */}
            <div className="absolute top-2 right-2 flex space-x-1">
              {!isAudioEnabled && (
                <div className="bg-red-500 rounded-full p-1">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              )}
              {!isVideoEnabled && (
                <div className="bg-red-500 rounded-full p-1">
                  <VideoOff className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          {!isCollapsed && (
            <div className="text-center">
              <div className="text-sm font-medium text-white truncate">
                {currentUserName} (Você)
              </div>
              <div className="text-xs text-gray-400">
                Organizador
              </div>
            </div>
          )}

          {/* Controls */}
          <div className={`flex ${isCollapsed ? 'flex-col space-y-1' : 'space-x-2 justify-center'}`}>
            <Button
              variant={isAudioEnabled ? "secondary" : "destructive"}
              size="sm"
              onClick={onToggleAudio}
              className={isCollapsed ? 'w-8 h-8 p-0' : ''}
            >
              {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              {!isCollapsed && (
                <span className="ml-2">
                  {isAudioEnabled ? 'Desativar' : 'Ativar'} Mic
                </span>
              )}
            </Button>
            
            <Button
              variant={isVideoEnabled ? "secondary" : "destructive"}
              size="sm"
              onClick={onToggleVideo}
              className={isCollapsed ? 'w-8 h-8 p-0' : ''}
            >
              {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              {!isCollapsed && (
                <span className="ml-2">
                  {isVideoEnabled ? 'Desativar' : 'Ativar'} Cam
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {!isCollapsed && (
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              Outros Participantes
            </div>
          )}
          
          {participants.length === 0 ? (
            <div className={`text-center ${isCollapsed ? 'px-2' : 'py-8'}`}>
              <UserCircle className={`mx-auto mb-2 text-gray-600 ${isCollapsed ? 'w-6 h-6' : 'w-12 h-12'}`} />
              {!isCollapsed && (
                <div className="text-sm text-gray-400">
                  Aguardando outros participantes...
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.userId}
                  className={`flex items-center ${
                    isCollapsed ? 'justify-center' : 'space-x-3'
                  } p-2 rounded-lg hover:bg-gray-800 transition-colors`}
                >
                  <div className="relative">
                    <Avatar className={isCollapsed ? 'w-8 h-8' : 'w-10 h-10'}>
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="bg-gray-600 text-white">
                        {getInitials(participant.userName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Connection status */}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${
                      participant.isConnected ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-white truncate">
                          {participant.userName}
                        </span>
                        {/* {participant.joinedAt && (
                          <Badge variant="secondary" className="text-xs">
                            {formatJoinTime(participant.joinedAt)}
                          </Badge>
                        )} */}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        {participant.isAudioEnabled ? (
                          <Volume2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <VolumeX className="w-3 h-3 text-red-500" />
                        )}
                        
                        {participant.isVideoEnabled ? (
                          <Video className="w-3 h-3 text-green-500" />
                        ) : (
                          <VideoOff className="w-3 h-3 text-red-500" />
                        )}
                        
                        <span className="text-xs text-gray-400">
                          {participant.isConnected ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-700">
        <div className={`flex ${isCollapsed ? 'flex-col space-y-2' : 'space-x-2'}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenChat}
            className={`flex-1 ${isCollapsed ? 'w-8 h-8 p-0' : ''}`}
          >
            <MessageSquare className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Chat</span>}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className={`flex-1 ${isCollapsed ? 'w-8 h-8 p-0' : ''}`}
          >
            <Settings className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Config</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}

