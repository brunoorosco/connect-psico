'use client'

import React, { useRef, useEffect } from 'react'
import { Mic, MicOff, Video, VideoOff } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'

interface VideoParticipantProps {
	userId: string
	stream?: MediaStream
	isAudioEnabled: boolean
	isVideoEnabled: boolean
	avatar?: string
	isLocal?: boolean
	name?: string
}

export function VideoParticipant({
	userId,
	stream,
	isAudioEnabled,
	isVideoEnabled,
	avatar,
	isLocal = false,
	name,
}: VideoParticipantProps) {
	const videoRef = useRef<HTMLVideoElement>(null)

	useEffect(() => {
		if (videoRef.current && stream && isVideoEnabled) {
			videoRef.current.srcObject = stream
		}
	}, [stream, isVideoEnabled])

	const displayName = name || `Usuário ${userId.slice(0, 8)}`
	const initials = displayName
		.split(' ')
		.map(n => n[0])
		.join('')
		.toUpperCase()

	return (
		<div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
			{/* Vídeo */}
			{isVideoEnabled && stream ? (
				<video
					ref={videoRef}
					autoPlay
					playsInline
					muted={isLocal}
					className="w-full h-full object-cover"
				/>
			) : (
				/* Avatar quando vídeo está desligado */
				<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
					<Avatar className="w-24 h-24">
						<AvatarImage src={avatar} alt={displayName} />
						<AvatarFallback className="text-2xl font-semibold text-white bg-transparent">
							{initials}
						</AvatarFallback>
					</Avatar>
				</div>
			)}

			{/* Overlay com informações do participante */}
			<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
				<div className="flex items-center justify-between">
					<span className="text-white text-sm font-medium truncate">
						{displayName} {isLocal && '(Você)'}
					</span>

					<div className="flex items-center space-x-2">
						{/* Indicador de microfone */}
						<div
							className={`p-1 rounded-full ${
								isAudioEnabled
									? 'bg-green-500/20 text-green-400'
									: 'bg-red-500/20 text-red-400'
							}`}
						>
							{isAudioEnabled ? (
								<Mic className="w-3 h-3" />
							) : (
								<MicOff className="w-3 h-3" />
							)}
						</div>

						{/* Indicador de vídeo */}
						<div
							className={`p-1 rounded-full ${
								isVideoEnabled
									? 'bg-green-500/20 text-green-400'
									: 'bg-red-500/20 text-red-400'
							}`}
						>
							{isVideoEnabled ? (
								<Video className="w-3 h-3" />
							) : (
								<VideoOff className="w-3 h-3" />
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Indicador de fala (pode ser implementado com análise de áudio) */}
			{isAudioEnabled && (
				<div className="absolute top-2 left-2">
					<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
				</div>
			)}
		</div>
	)
}
