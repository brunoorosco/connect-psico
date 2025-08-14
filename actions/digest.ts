import { prisma } from "@/lib/db";
import { DIGEST_MINUTES } from "@/lib/digest-config";
import { addMinutesISO, inQuietHours, nextQuietEndISO } from "@/lib/time";


/**
 * Empilha evento no digest do receiverId.
 * - Cria/atualiza a linha com msgCount++
 * - Mantém a janela original; se a janela já expirou, reabre conforme regra
 */
export async function ingestDigest(receiverId: string) {
  if (!receiverId) return;

  const windowEndAt = inQuietHours() ? nextQuietEndISO() : addMinutesISO(DIGEST_MINUTES);

  await prisma.notifyDigest.upsert({
    where: { receiverId },
    create: {
      receiverId,
      windowEndAt: new Date(windowEndAt),
      msgCount: 1,
    },
    update: {
      msgCount: { increment: 1 },
      lastEventAt: new Date(),
      windowEndAt: (await prisma.notifyDigest.findUnique({ where: { receiverId }, select: { windowEndAt: true } }))
        ?.windowEndAt! < new Date()
        ? new Date(windowEndAt) // se já expirou, reabre
        : undefined,            // caso contrário, mantém
    },
  });
}

/**
 * Busca um lote pronto para processar e remove essas linhas de uma vez.
 * Obs.: Em ambientes com muita concorrência, ideal seria lock. Para Vercel + cron, isso é suficiente.
 */
export async function takeDueDigests(limit: number) {
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    const rows = await tx.notifyDigest.findMany({
      where: { windowEndAt: { lte: now } },
      orderBy: { windowEndAt: "asc" },
      take: limit,
    });

    if (!rows.length) return [] as typeof rows;

    await tx.notifyDigest.deleteMany({
      where: {
        receiverId: { in: rows.map(r => r.receiverId) },
        windowEndAt: { lte: now }, // garante que só apaga o que está vencido
      },
    });

    return rows;
  });
}

/**
 * Reabre janela em caso de falha de envio.
 */
export async function reopenWindow(receiverId: string, extraCount: number, minutes = 5) {
  await prisma.notifyDigest.upsert({
    where: { receiverId },
    create: {
      receiverId,
      windowEndAt: new Date(addMinutesISO(minutes)),
      msgCount: extraCount,
    },
    update: {
      msgCount: { increment: extraCount },
      lastEventAt: new Date(),
      windowEndAt: new Date(addMinutesISO(minutes)),
    },
  });
}
