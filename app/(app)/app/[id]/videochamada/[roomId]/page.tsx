// app/video-call/[id]/page.tsx
"use server"
import ChatVideoPage from "@presentation/pages/chatVideo"
import { prisma } from "@/lib/db"
import VideoChat from "@components/videoChat";

export default async function VideoCallRoomPage({ params }: { params: { roomId: string } }) {
  const room = await prisma.videoCallRoom.findUnique({
    where: { id: params.roomId },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!room) return <div>Sala não encontrada</div>;
  
  const remoteUser = room.participants.find(p => p.user.id !== /* currentUserId */ "")
  const remoteUserId = remoteUser?.user.id

  return (
    <div>
      <h1 className="text-xl font-bold">Consulta Remoto</h1>
      <p>Agendada para: {new Date(room.scheduledAt).toLocaleString()}</p>
      <h2 className="mt-4">Participantes:</h2>
      <ul>
        {room.participants.map((p) => (
          <li key={p.user.id}>{p.user.name}</li>
        ))}
      </ul>
      <VideoChat remoteUserId={remoteUserId ?? ""} isScheduledCall />
    </div>
  );
}
