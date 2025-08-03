'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Send, X } from 'lucide-react'

interface ChatMessage {
	id: string
	userId: string
	message: string
	timestamp: Date
	avatar?: string
	userName?: string
}

interface ChatPanelProps {
	isOpen: boolean
	onClose: () => void
	messages: ChatMessage[]
	onSendMessage: (message: string) => void
	currentUserId: string
}

export function ChatPanel({
	isOpen,
	onClose,
	messages,
	onSendMessage,
	currentUserId,
}: ChatPanelProps) {
	const [newMessage, setNewMessage] = useState('')
	const messagesEndRef = useRef<HTMLDivElement>(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	const handleSendMessage = () => {
		if (newMessage.trim()) {
			onSendMessage(newMessage.trim())
			setNewMessage('')
		}
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSendMessage()
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed right-4 top-4 bottom-20 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
				<h3 className="font-semibold text-gray-900 dark:text-white">Chat</h3>
				<Button
					variant="ghost"
					size="sm"
					onClick={onClose}
					className="h-8 w-8 p-0"
				>
					<X className="w-4 h-4" />
				</Button>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.length === 0 ? (
					<div className="text-center text-gray-500 dark:text-gray-400 text-sm">
						Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!
					</div>
				) : (
					messages.map(message => {
						const isOwnMessage = message.userId === currentUserId
						const displayName =
							message.userName || `Usuário ${message.userId.slice(0, 8)}`
						const initials = displayName
							.split(' ')
							.map(n => n[0])
							.join('')
							.toUpperCase()

						return (
							<div
								key={message.id}
								className={`flex ${
									isOwnMessage ? 'justify-end' : 'justify-start'
								}`}
							>
								<div
									className={`flex max-w-[80%] ${
										isOwnMessage ? 'flex-row-reverse' : 'flex-row'
									}`}
								>
									{!isOwnMessage && (
										<Avatar className="w-8 h-8 mr-2 flex-shrink-0">
											<AvatarImage src={message.avatar} alt={displayName} />
											<AvatarFallback className="text-xs">
												{initials}
											</AvatarFallback>
										</Avatar>
									)}

									<div className={`${isOwnMessage ? 'mr-2' : ''}`}>
										{!isOwnMessage && (
											<div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
												{displayName}
											</div>
										)}

										<div
											className={`px-3 py-2 rounded-lg ${
												isOwnMessage
													? 'bg-blue-500 text-white'
													: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
											}`}
										>
											<p className="text-sm whitespace-pre-wrap">
												{message.message}
											</p>
											<div
												className={`text-xs mt-1 ${
													isOwnMessage
														? 'text-blue-100'
														: 'text-gray-500 dark:text-gray-400'
												}`}
											>
												{message.timestamp.toLocaleTimeString('pt-BR', {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</div>
										</div>
									</div>
								</div>
							</div>
						)
					})
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div className="p-4 border-t border-gray-200 dark:border-gray-700">
				<div className="flex space-x-2">
					<Input
						value={newMessage}
						onChange={e => setNewMessage(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Digite sua mensagem..."
						className="flex-1"
					/>
					<Button
						onClick={handleSendMessage}
						disabled={!newMessage.trim()}
						size="sm"
						className="px-3"
					>
						<Send className="w-4 h-4" />
					</Button>
				</div>
			</div>
		</div>
	)
}
