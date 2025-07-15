"use server"

import { encode, getToken } from "next-auth/jwt"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import jwt from "jsonwebtoken"

export async function getAccessTokenAction() {
  const token = await getToken({ req: { headers: { cookie: cookies().toString() } }, secret: process.env.AUTH_SECRET })
  const acessToken = cookies().get("authjs.session-token")
  if (!token || !token.sub || !acessToken?.value) {
    return { ok: false, error: "Token inválido" }
  }

  const payload = { sub: token.sub, name: token.name }
  const access = jwt.sign(payload,process.env.AUTH_SECRET!, {expiresIn: '8h'})
  return {
    ok: true,
    userId: token.sub,
    accessToken: access,
  }
}

type MessageInput = {
  to: string
  text: string
}

export async function sendMessageAction({ to, text }: MessageInput) {
  const token = await getToken({ req: { headers: { cookie: cookies().toString() } }, secret: process.env.AUTH_SECRET })

  if (!token || !token.sub) {
    return { ok: false, error: "Não autenticado" }
  }

  return { ok: true }
}
