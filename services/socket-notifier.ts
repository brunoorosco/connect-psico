import { env } from "@/config/application";

export async function notifyConsultationProcessed(sessionId: string, result: any, userId?: string) {
    try {
        console.log(`[System] Sending notification for session ${sessionId} to user ${userId}`);

        const response = await fetch(`${env.baseUrlPsicomaisApi}/api/internal/notify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: "consultation.processed",
                payload: {
                    sessionId,
                    userId,
                    ...result,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to notify API: ${response.status} ${response.statusText}`);
        }

        console.log("✅ [System] Notification queued successfully");
    } catch (error) {
        console.error("❌ [System] Failed to send notification:", error);
    }
}
