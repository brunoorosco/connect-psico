import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/application";
import { io } from "socket.io-client";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, payload } = body;

        console.log(`[Internal Notify] Received ${type} for session ${payload?.sessionId}`);

        // Conectar ao servidor de socket (que está na API externa ou localhost)
        // Usamos socket.io-client para emular um cliente ou um emissor
        const socket = io(env.baseUrlPsicomaisApi, {
            transports: ["websocket"],
            query: {
                source: "internal-notify"
            }
        });

        // Emitir o evento para o servidor
        // O servidor deve estar configurado para propagar este evento para os clientes da sala/usuário
        // Se o servidor não tiver handler para retransmitir, isso não funcionará, mas é a melhor tentativa dado o cenário.
        // Assumindo que o servidor aceita 'consultation.processed' e faz broadcast.
        socket.emit(type, payload);

        // Pequeno delay para garantir envio (hack para conexões efêmeras)
        await new Promise(resolve => setTimeout(resolve, 500));

        socket.disconnect();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to process notification:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
