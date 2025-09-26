// lib/minion
import * as Minio from "minio"

export const bucket = process.env.MINIO_BUCKET as string

export const minio = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT as string,
  port: 443,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY as string,
  secretKey: process.env.MINIO_SECRET_KEY as string,
})
