import { Inngest } from "inngest";
import { env } from "@/config/application";

// Create a client to send and receive events
export const inngest = new Inngest({ id: env.applicationName || "psico-mais" });
