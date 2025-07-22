// components/VideoCallScheduleMenu.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getUserVideoCalls } from "@/actions/scheduleVideo";

export function VideoCallScheduleMenu() {
  const { data: session } = useSession();
  const [calls, setCalls] = useState<any[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;
    getUserVideoCalls(session.user.id).then(setCalls);
  }, [session]);

  if (!session) return null;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Próximas Vídeo-Chamadas</h2>
      {calls.length === 0 && <p>Nenhum agendamento encontrado.</p>}
      <ul>
        {calls.map((call) => (
          <li key={call.room.id} className="mb-2">
            <Link
              href={`./videochamada/${call.room.id}`}
              className="text-blue-600 hover:underline"
            >
              Sala: {call.room.id} <br />
              Horário: {new Date(call.room.scheduledAt).toLocaleString()}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
