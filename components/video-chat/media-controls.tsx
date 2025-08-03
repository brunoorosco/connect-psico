'use client'

import React from 'react'
import { Button } from '../ui/button'
import {
	Mic,
	MicOff,
	Video,
	VideoOff,
	Phone,
	Settings,
	MessageSquare,
	Monitor,
	MonitorOff,
} from 'lucide-react'

interface MediaControlsProps {
	isAudioEnabled: boolean
	isVideoEnabled: boolean
	isScreenSharing?: boolean
	onToggleAudio: () => void
	onToggleVideo: () => void
	onToggleScreenShare?: () => void
	onOpenSettings: () => void
	onToggleChat: () => void
	onLeaveCall: () => void
	isChatOpen?: boolean
}

export function MediaControls({
	isAudioEnabled,
	isVideoEnabled,
	isScreenSharing = false,
	onToggleAudio,
	onToggleVideo,
	onToggleScreenShare,
	onOpenSettings,
	onToggleChat,
	onLeaveCall,
	isChatOpen = false,
}: MediaControlsProps) {
	return (
		<div className="flex items-center justify-center space-x-4 p-4 bg-gray-900/90 backdrop-blur-sm rounded-lg">
			{/* Controle de Microfone */}
			<Button
				variant={isAudioEnabled ? 'default' : 'destructive'}
				size="lg"
				onClick={onToggleAudio}
				className="rounded-full w-12 h-12 p-0"
			>
				{isAudioEnabled ? (
					<Mic className="w-5 h-5" />
				) : (
					<MicOff className="w-5 h-5" />
				)}
			</Button>

			{/* Controle de Vídeo */}
			<Button
				variant={isVideoEnabled ? 'default' : 'destructive'}
				size="lg"
				onClick={onToggleVideo}
				className="rounded-full w-12 h-12 p-0"
			>
				{isVideoEnabled ? (
					<Video className="w-5 h-5" />
				) : (
					<VideoOff className="w-5 h-5" />
				)}
			</Button>

			{/* Compartilhamento de Tela */}
			{onToggleScreenShare && (
				<Button
					variant={isScreenSharing ? 'default' : 'outline'}
					size="lg"
					onClick={onToggleScreenShare}
					className="rounded-full w-12 h-12 p-0"
				>
					{isScreenSharing ? (
						<MonitorOff className="w-5 h-5" />
					) : (
						<Monitor className="w-5 h-5" />
					)}
				</Button>
			)}

			{/* Chat */}
			<Button
				variant={isChatOpen ? 'default' : 'outline'}
				size="lg"
				onClick={onToggleChat}
				className="rounded-full w-12 h-12 p-0"
			>
				<MessageSquare className="w-5 h-5" />
			</Button>

			{/* Configurações */}
			<Button
				variant="outline"
				size="lg"
				onClick={onOpenSettings}
				className="rounded-full w-12 h-12 p-0"
			>
				<Settings className="w-5 h-5" />
			</Button>

			{/* Sair da Chamada */}
			<Button
				variant="destructive"
				size="lg"
				onClick={onLeaveCall}
				className="rounded-full w-12 h-12 p-0 bg-red-600 hover:bg-red-700"
			>
				<Phone className="w-5 h-5 rotate-[135deg]" />
			</Button>
		</div>
	)
}
