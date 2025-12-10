import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processConsultationTranscription } from "@/lib/inngest/functions/transcription";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        processConsultationTranscription, // Will be created in the next step
    ],
});
