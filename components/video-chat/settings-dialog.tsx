'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select'
import { Separator } from '../ui/separator'
import { Mic, Video, Volume2 } from 'lucide-react'

interface MediaDevice {
	deviceId: string
	label: string
	kind: MediaDeviceKind
}

interface SettingsDialogProps {
	isOpen: boolean
	onClose: () => void
	onDeviceChange: (deviceId: string, kind: MediaDeviceKind) => void
}

export function SettingsDialog({
	isOpen,
	onClose,
	onDeviceChange,
}: SettingsDialogProps) {
	const [audioInputDevices, setAudioInputDevices] = useState<MediaDevice[]>([])
	const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDevice[]>(
		[]
	)
	const [videoInputDevices, setVideoInputDevices] = useState<MediaDevice[]>([])
	const [selectedAudioInput, setSelectedAudioInput] = useState<string>('')
	const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>('')
	const [selectedVideoInput, setSelectedVideoInput] = useState<string>('')
	const [testStream, setTestStream] = useState<MediaStream | null>(null)

	useEffect(() => {
		if (isOpen) {
			loadDevices()
		}

		return () => {
			if (testStream) {
				testStream.getTracks().forEach(track => track.stop())
			}
		}
	}, [isOpen])

	const loadDevices = async () => {
		try {
			// Solicitar permissões primeiro
			await navigator.mediaDevices.getUserMedia({ audio: true, video: true })

			const devices = await navigator.mediaDevices.enumerateDevices()

			const audioInputs = devices.filter(device => device.kind === 'audioinput')
			const audioOutputs = devices.filter(
				device => device.kind === 'audiooutput'
			)
			const videoInputs = devices.filter(device => device.kind === 'videoinput')

			setAudioInputDevices(
				audioInputs.map(device => ({
					deviceId: device.deviceId,
					label: device.label || `Microfone ${audioInputs.indexOf(device) + 1}`,
					kind: device.kind,
				}))
			)

			setAudioOutputDevices(
				audioOutputs.map(device => ({
					deviceId: device.deviceId,
					label:
						device.label || `Alto-falante ${audioOutputs.indexOf(device) + 1}`,
					kind: device.kind,
				}))
			)

			setVideoInputDevices(
				videoInputs.map(device => ({
					deviceId: device.deviceId,
					label: device.label || `Câmera ${videoInputs.indexOf(device) + 1}`,
					kind: device.kind,
				}))
			)

			// Definir dispositivos padrão
			if (audioInputs.length > 0 && !selectedAudioInput) {
				setSelectedAudioInput(audioInputs[0].deviceId)
			}
			if (audioOutputs.length > 0 && !selectedAudioOutput) {
				setSelectedAudioOutput(audioOutputs[0].deviceId)
			}
			if (videoInputs.length > 0 && !selectedVideoInput) {
				setSelectedVideoInput(videoInputs[0].deviceId)
			}
		} catch (error) {
			console.error('Erro ao carregar dispositivos:', error)
		}
	}

	const testAudio = async () => {
		try {
			if (testStream) {
				testStream.getTracks().forEach(track => track.stop())
			}

			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					deviceId: selectedAudioInput
						? { exact: selectedAudioInput }
						: undefined,
				},
			})

			setTestStream(stream)

			// Reproduzir áudio por alguns segundos para teste
			setTimeout(() => {
				stream.getTracks().forEach(track => track.stop())
				setTestStream(null)
			}, 3000)
		} catch (error) {
			console.error('Erro ao testar áudio:', error)
		}
	}

	const testVideo = async () => {
		try {
			if (testStream) {
				testStream.getTracks().forEach(track => track.stop())
			}

			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					deviceId: selectedVideoInput
						? { exact: selectedVideoInput }
						: undefined,
				},
			})

			setTestStream(stream)

			// Parar o teste após alguns segundos
			setTimeout(() => {
				stream.getTracks().forEach(track => track.stop())
				setTestStream(null)
			}, 5000)
		} catch (error) {
			console.error('Erro ao testar vídeo:', error)
		}
	}

	const handleSave = () => {
		if (selectedAudioInput) {
			onDeviceChange(selectedAudioInput, 'audioinput')
		}
		if (selectedAudioOutput) {
			onDeviceChange(selectedAudioOutput, 'audiooutput')
		}
		if (selectedVideoInput) {
			onDeviceChange(selectedVideoInput, 'videoinput')
		}
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Configurações de Áudio e Vídeo</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Configurações de Áudio */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<Mic className="w-5 h-5" />
							<h3 className="text-lg font-medium">Áudio</h3>
						</div>

						<div className="space-y-3">
							<div>
								<Label htmlFor="audio-input">Microfone</Label>
								<Select
									value={selectedAudioInput}
									onValueChange={setSelectedAudioInput}
								>
									<SelectTrigger>
										<SelectValue placeholder="Selecione um microfone" />
									</SelectTrigger>
									<SelectContent>
										{audioInputDevices.map(device => (
											<SelectItem key={device.deviceId} value={device.deviceId}>
												{device.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="audio-output">Alto-falante</Label>
								<Select
									value={selectedAudioOutput}
									onValueChange={setSelectedAudioOutput}
								>
									<SelectTrigger>
										<SelectValue placeholder="Selecione um alto-falante" />
									</SelectTrigger>
									<SelectContent>
										{audioOutputDevices.map(device => (
											<SelectItem key={device.deviceId} value={device.deviceId}>
												{device.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<Button onClick={testAudio} variant="outline" size="sm">
								<Volume2 className="w-4 h-4 mr-2" />
								Testar Áudio
							</Button>
						</div>
					</div>

					<Separator />

					{/* Configurações de Vídeo */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<Video className="w-5 h-5" />
							<h3 className="text-lg font-medium">Vídeo</h3>
						</div>

						<div className="space-y-3">
							<div>
								<Label htmlFor="video-input">Câmera</Label>
								<Select
									value={selectedVideoInput}
									onValueChange={setSelectedVideoInput}
								>
									<SelectTrigger>
										<SelectValue placeholder="Selecione uma câmera" />
									</SelectTrigger>
									<SelectContent>
										{videoInputDevices.map(device => (
											<SelectItem key={device.deviceId} value={device.deviceId}>
												{device.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<Button onClick={testVideo} variant="outline" size="sm">
								<Video className="w-4 h-4 mr-2" />
								Testar Vídeo
							</Button>
						</div>
					</div>

					{/* Preview do teste */}
					{testStream && (
						<div className="space-y-2">
							<Label>Preview do Teste</Label>
							<div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
								{testStream.getVideoTracks().length > 0 ? (
									<video
										autoPlay
										muted
										className="w-full max-w-xs mx-auto rounded"
										ref={video => {
											if (video) video.srcObject = testStream
										}}
									/>
								) : (
									<div className="text-sm text-gray-600 dark:text-gray-400">
										Testando áudio... Fale no microfone.
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				<div className="flex justify-end space-x-2 pt-4">
					<Button variant="outline" onClick={onClose}>
						Cancelar
					</Button>
					<Button onClick={handleSave}>Salvar Configurações</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
