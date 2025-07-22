import React from "react"
import ChatVideoPage from "@presentation/pages/chatVideo"
import { VideoCallScheduleMenu } from "@components/videoChat/sidebarSchedules"

const PageChatVideo: React.FC = () => {
  // return <ChatVideoPage />
  return <VideoCallScheduleMenu />
}

export default PageChatVideo

// "use client"
// import React, { useState, useRef, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Badge } from '@/components/ui/badge';
// import {
//   Mic,
//   MicOff,
//   Video,
//   VideoOff,
//   PhoneOff,
//   ScreenShare,
//   MessageSquare,
//   Settings,
//   Users,
//   Send,
//   MoreVertical,
//   PinIcon,
//   Maximize
// } from 'lucide-react';
// import { useToast } from '@/hooks/useToast';

// interface Participant {
//   id: string;
//   name: string;
//   isMuted: boolean;
//   hasVideo: boolean;
//   isPresenting: boolean;
// }

// interface ChatMessage {
//   id: string;
//   sender: string;
//   message: string;
//   timestamp: string;
// }

// const VideoCall = () => {
//   const { toast } = useToast();
//   const [isMuted, setIsMuted] = useState(false);
//   const [hasVideo, setHasVideo] = useState(true);
//   const [isPresenting, setIsPresenting] = useState(false);
//   const [showChat, setShowChat] = useState(false);
//   const [showParticipants, setShowParticipants] = useState(false);
//   const [chatMessage, setChatMessage] = useState('');
//   const [isCallStarted, setIsCallStarted] = useState(false);

//   const videoRef = useRef<HTMLVideoElement>(null);

//   const [participants] = useState<Participant[]>([
//     { id: '1', name: 'Dr. João Silva', isMuted: false, hasVideo: true, isPresenting: false },
//     { id: '2', name: 'Maria Santos', isMuted: true, hasVideo: true, isPresenting: false },
//     { id: '3', name: 'Pedro Costa', isMuted: false, hasVideo: false, isPresenting: false },
//   ]);

//   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
//     { id: '1', sender: 'Dr. João Silva', message: 'Olá, como está se sentindo hoje?', timestamp: '14:30' },
//     { id: '2', sender: 'Maria Santos', message: 'Estou bem, obrigada!', timestamp: '14:31' },
//   ]);

//   useEffect(() => {
//     if (isCallStarted && videoRef.current && hasVideo) {
//       // Simular acesso à câmera
//       navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
//         .then(stream => {
//           if (videoRef.current) {
//             videoRef.current.srcObject = stream;
//           }
//         })
//         .catch(() => {
//           // Fallback para preview mockado
//           console.log('Camera access not available, using mock preview');
//         });
//     }
//   }, [isCallStarted, hasVideo]);

//   const toggleMute = () => {
//     setIsMuted(!isMuted);
//     toast({
//       title: isMuted ? "Microfone ativado" : "Microfone desativado",
//       duration: 2000,
//     });
//   };

//   const toggleVideo = () => {
//     setHasVideo(!hasVideo);
//     toast({
//       title: hasVideo ? "Câmera desativada" : "Câmera ativada",
//       duration: 2000,
//     });
//   };

//   const toggleScreenShare = () => {
//     setIsPresenting(!isPresenting);
//     toast({
//       title: isPresenting ? "Compartilhamento interrompido" : "Compartilhando tela",
//       duration: 2000,
//     });
//   };

//   const sendMessage = () => {
//     if (chatMessage.trim()) {
//       const newMessage: ChatMessage = {
//         id: Date.now().toString(),
//         sender: 'Você',
//         message: chatMessage,
//         timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
//       };
//       setChatMessages([...chatMessages, newMessage]);
//       setChatMessage('');
//     }
//   };

//   const endCall = () => {
//     toast({
//       title: "Chamada encerrada",
//       description: "A videochamada foi finalizada.",
//       duration: 3000,
//     });
//     // Aqui você redirecionaria para outra página
//   };

//   const startCall = () => {
//     setIsCallStarted(true);
//     toast({
//       title: "Entrando na chamada...",
//       duration: 2000,
//     });
//   };

//   if (!isCallStarted) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center p-4">
//         <Card className="w-full max-w-md p-8 text-center">
//           <div className="space-y-6">
//             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
//               <Video className="w-8 h-8 text-primary" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold mb-2">Videochamada</h1>
//               <p className="text-muted-foreground">
//                 Clique para entrar na sala de atendimento
//               </p>
//             </div>
//             <div className="space-y-4">
//               <div className="flex gap-2 justify-center">
//                 <Button
//                   variant={isMuted ? "destructive" : "outline"}
//                   size="icon"
//                   onClick={toggleMute}
//                 >
//                   {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
//                 </Button>
//                 <Button
//                   variant={hasVideo ? "outline" : "destructive"}
//                   size="icon"
//                   onClick={toggleVideo}
//                 >
//                   {hasVideo ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
//                 </Button>
//               </div>
//               <Button onClick={startCall} className="w-full" size="lg">
//                 Entrar na chamada
//               </Button>
//             </div>
//           </div>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black flex flex-col">
//       {/* Header */}
//       <div className="bg-black/80 backdrop-blur-sm p-4 flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <Badge variant="secondary" className="bg-green-600 text-white">
//             Ao vivo
//           </Badge>
//           <span className="text-white text-sm">
//             Consulta - Dr. João Silva
//           </span>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
//             <Settings className="w-4 h-4" />
//           </Button>
//           <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
//             <MoreVertical className="w-4 h-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex relative">
//         {/* Video Area */}
//         <div className="flex-1 relative">
//           {/* Main Video */}
//           <div className="w-full h-full bg-gray-900 relative">
//             {isPresenting ? (
//               <div className="w-full h-full bg-gray-800 flex items-center justify-center">
//                 <div className="text-center text-white">
//                   <ScreenShare className="w-16 h-16 mx-auto mb-4 opacity-50" />
//                   <p className="text-lg">Compartilhando tela</p>
//                   <p className="text-sm opacity-70">Sua tela está sendo compartilhada</p>
//                 </div>
//               </div>
//             ) : (
//               <div className="w-full h-full bg-gray-800 flex items-center justify-center">
//                 {hasVideo ? (
//                   <video
//                     ref={videoRef}
//                     autoPlay
//                     muted
//                     className="w-full h-full object-cover"
//                     style={{ transform: 'scaleX(-1)' }}
//                   />
//                 ) : (
//                   <div className="text-center text-white">
//                     <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
//                       <span className="text-2xl font-bold">DS</span>
//                     </div>
//                     <p className="text-lg">Dr. João Silva</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Participant Videos Overlay */}
//             <div className="absolute top-4 right-4 space-y-2">
//               {participants.map((participant) => (
//                 <div key={participant.id} className="relative">
//                   <Card className="w-32 h-24 bg-gray-800 border-gray-600 overflow-hidden">
//                     {participant.hasVideo ? (
//                       <div className="w-full h-full bg-gray-700 flex items-center justify-center">
//                         <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
//                           <span className="text-xs font-bold text-white">
//                             {participant.name.split(' ').map(n => n[0]).join('')}
//                           </span>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="w-full h-full bg-gray-700 flex items-center justify-center">
//                         <VideoOff className="w-4 h-4 text-gray-400" />
//                       </div>
//                     )}
//                     <div className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1 rounded">
//                       {participant.name.split(' ')[0]}
//                     </div>
//                     {participant.isMuted && (
//                       <div className="absolute top-1 right-1">
//                         <MicOff className="w-3 h-3 text-red-500" />
//                       </div>
//                     )}
//                   </Card>
//                 </div>
//               ))}
//             </div>

//             {/* Self Video Preview */}
//             <div className="absolute bottom-4 right-4">
//               <Card className="w-48 h-36 bg-gray-800 border-gray-600 overflow-hidden">
//                 {hasVideo ? (
//                   <video
//                     className="w-full h-full object-cover"
//                     autoPlay
//                     muted
//                     style={{ transform: 'scaleX(-1)' }}
//                   />
//                 ) : (
//                   <div className="w-full h-full bg-gray-700 flex items-center justify-center">
//                     <VideoOff className="w-6 h-6 text-gray-400" />
//                   </div>
//                 )}
//                 <div className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1 rounded">
//                   Você
//                 </div>
//                 {isMuted && (
//                   <div className="absolute top-1 right-1">
//                     <MicOff className="w-3 h-3 text-red-500" />
//                   </div>
//                 )}
//               </Card>
//             </div>
//           </div>
//         </div>

//         {/* Sidebar */}
//         {(showChat || showParticipants) && (
//           <div className="w-80 bg-background border-l">
//             {showChat && (
//               <div className="h-full flex flex-col">
//                 <div className="p-4 border-b">
//                   <h3 className="font-semibold flex items-center justify-between">
//                     Chat da reunião
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => setShowChat(false)}
//                     >
//                       ×
//                     </Button>
//                   </h3>
//                 </div>
//                 <ScrollArea className="flex-1 p-4">
//                   <div className="space-y-4">
//                     {chatMessages.map((msg) => (
//                       <div key={msg.id} className="space-y-1">
//                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                           <span className="font-medium">{msg.sender}</span>
//                           <span>{msg.timestamp}</span>
//                         </div>
//                         <p className="text-sm">{msg.message}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </ScrollArea>
//                 <div className="p-4 border-t flex gap-2">
//                   <Input
//                     placeholder="Digite sua mensagem..."
//                     value={chatMessage}
//                     onChange={(e) => setChatMessage(e.target.value)}
//                     onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//                   />
//                   <Button size="icon" onClick={sendMessage}>
//                     <Send className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             )}

//             {showParticipants && (
//               <div className="h-full">
//                 <div className="p-4 border-b">
//                   <h3 className="font-semibold flex items-center justify-between">
//                     Participantes ({participants.length + 1})
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => setShowParticipants(false)}
//                     >
//                       ×
//                     </Button>
//                   </h3>
//                 </div>
//                 <div className="p-4 space-y-3">
//                   <div className="flex items-center gap-3 p-2 rounded-lg">
//                     <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
//                       <span className="text-xs font-bold text-white">V</span>
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-sm font-medium">Você</p>
//                     </div>
//                     <div className="flex gap-1">
//                       {isMuted && <MicOff className="w-4 h-4 text-red-500" />}
//                       {!hasVideo && <VideoOff className="w-4 h-4 text-gray-400" />}
//                     </div>
//                   </div>
//                   {participants.map((participant) => (
//                     <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg">
//                       <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
//                         <span className="text-xs font-bold">
//                           {participant.name.split(' ').map(n => n[0]).join('')}
//                         </span>
//                       </div>
//                       <div className="flex-1">
//                         <p className="text-sm font-medium">{participant.name}</p>
//                       </div>
//                       <div className="flex gap-1">
//                         {participant.isMuted && <MicOff className="w-4 h-4 text-red-500" />}
//                         {!participant.hasVideo && <VideoOff className="w-4 h-4 text-gray-400" />}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Controls */}
//       <div className="bg-black/80 backdrop-blur-sm p-4">
//         <div className="flex items-center justify-center gap-4">
//           <Button
//             variant={isMuted ? "destructive" : "secondary"}
//             size="icon"
//             className="rounded-full w-12 h-12"
//             onClick={toggleMute}
//           >
//             {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
//           </Button>

//           <Button
//             variant={hasVideo ? "secondary" : "destructive"}
//             size="icon"
//             className="rounded-full w-12 h-12"
//             onClick={toggleVideo}
//           >
//             {hasVideo ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
//           </Button>

//           <Button
//             variant={isPresenting ? "default" : "secondary"}
//             size="icon"
//             className="rounded-full w-12 h-12"
//             onClick={toggleScreenShare}
//           >
//             <ScreenShare className="w-5 h-5" />
//           </Button>

//           <Button
//             variant="secondary"
//             size="icon"
//             className="rounded-full w-12 h-12"
//             onClick={() => {
//               setShowChat(!showChat);
//               setShowParticipants(false);
//             }}
//           >
//             <MessageSquare className="w-5 h-5" />
//           </Button>

//           <Button
//             variant="secondary"
//             size="icon"
//             className="rounded-full w-12 h-12"
//             onClick={() => {
//               setShowParticipants(!showParticipants);
//               setShowChat(false);
//             }}
//           >
//             <Users className="w-5 h-5" />
//           </Button>

//           <Button
//             variant="destructive"
//             size="icon"
//             className="rounded-full w-12 h-12 ml-8"
//             onClick={endCall}
//           >
//             <PhoneOff className="w-5 h-5" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoCall;
