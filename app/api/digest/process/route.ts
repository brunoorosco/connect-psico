import { NextResponse } from "next/server";

import { getProfessionalById } from "@/actions/users";
import { axiosInstanceChatz } from "@/infra/httpClient/chatzMessageApi";
import { reopenWindow, takeDueDigests } from "@/actions/digest";
import { inQuietHours, nextQuietEndISO } from "@/lib/time";
import { PROCESS_BATCH_SIZE } from "@/lib/digest-config";

export const dynamic = "force-dynamic";

export async function GET() {
  // Quiet hours: apenas empurre janelas vencidas para 08:00
  if (inQuietHours()) {
    // empurrar será feito implicitamente na próxima ingest; aqui só não processamos
    return NextResponse.json({ ok: true, processed: 0, quiet: true, next: nextQuietEndISO() });
  }

  let processed = 0;

  while (true) {
    const rows = await takeDueDigests(PROCESS_BATCH_SIZE);
    if (!rows.length) break;

    for (const row of rows) {
      try {
        const user = await getProfessionalById(row.receiverId);
        const phoneRaw = user?.phone ? String(user.phone).replace(/\D/g, "") : "";

        if (!user || !phoneRaw) continue;

        const firstName = String(user.name || "").split(" ")[0] || "você";
        await axiosInstanceChatz.post("/messages/send", {
          body: `*PsicoMais:*\nOi ${firstName}, você recebeu ${row.msgCount} nova(s) mensagem(ns) na plataforma nos últimos minutos. Acesse: https://psicomais.com/app`,
          number: "55" + phoneRaw,
        });

        processed++;
      } catch (e) {
        // se falhar o envio, reabra a janela para reprocessar depois
        await reopenWindow(row.receiverId, row.msgCount, 5);
      }
    }
  }

  return NextResponse.json({ ok: true, processed });
}
