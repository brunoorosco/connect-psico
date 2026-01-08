"use server"

import { getToken } from "next-auth/jwt"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function getAccessToken() {
  const token = await getToken({
    req: { headers: { cookie: cookies().toString() } },
    secret: process.env.AUTH_SECRET || "secret",
    salt: process.env.AUTH_SECRET!,
  })
  const acessToken = cookies().get("authjs.session-token")
  if (!token || !token.sub || !acessToken?.value) {
    return { ok: false, error: "Token inválido" }
  }

  const payload = { sub: token.sub, name: token.name }
  const access = jwt.sign(payload, process.env.AUTH_SECRET!, { expiresIn: "8h" })
  return {
    ok: true,
    userId: token.sub,
    accessToken: access,
  }
}
