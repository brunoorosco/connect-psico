import { env } from "@/config/application"
import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: env.urlRedis,
  token: env.tokenRedis,
})
