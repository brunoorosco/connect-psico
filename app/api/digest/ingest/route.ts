import { ingestDigest } from "@/actions/digest";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { receiverId } = await req.json().catch(() => ({}));
  if (!receiverId) return NextResponse.json({ ok: false, error: "receiverId required" }, { status: 400 });

  await ingestDigest(receiverId);
  return NextResponse.json({ ok: true });
}