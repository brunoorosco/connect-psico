import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/application";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Relay to Backend API
        const response = await fetch(`${env.baseUrlPsicomaisApi}/api/recordings/process-async`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Backend Error:", errorText);
            return NextResponse.json({ error: "Backend failed to accept job" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to trigger transcription:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
