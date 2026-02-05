
import mongoose, { Schema, model, models } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export interface ITranscription {
    userId: string;
    patientId: string;
    sessionId: string;
    summary?: string;
    text: string;
    createdAt?: Date;
}

const TranscriptionSchema = new Schema<ITranscription>({
    userId: { type: String, required: true },
    patientId: { type: String, required: true },
    sessionId: { type: String, required: true },
    summary: { type: String },
    text: { type: String, required: true },
}, { timestamps: true });

export const Transcription = models.Transcription || model<ITranscription>('Transcription', TranscriptionSchema);

export default dbConnect;
