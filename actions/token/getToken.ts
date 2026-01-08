"use server"

import jwt from "jsonwebtoken"
import { auth } from "@/auth"
import { env } from "@/config/application"

export async function getAccessToken() {
  const session = await auth()
  if (!session?.accessToken) {
    return { ok: false, error: "Token inválido" }
  }

  const payload = { sub: session.user.id, name: session.user.name }
  const access = jwt.sign(payload, env.jwtSecret || "secret", { expiresIn: "8h" })
  return {
    ok: true,
    userId: session.user.id,
    accessToken: access,
  }
}
