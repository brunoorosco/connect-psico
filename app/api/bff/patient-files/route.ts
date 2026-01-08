import axios from "axios"
import { env } from "@/config/application"
import { getAccessToken } from "@/actions/token/getToken"

const api = axios.create({
  baseURL: env.baseUrlPsicomaisApi + "/api",
  timeout: 60000,
})

async function getSession() {
  return getAccessToken()
}

/* LIST */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get("patientId")
  const session = await getSession()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  api.defaults.headers.Authorization = `Bearer ${session.accessToken}`

  const res = await api.get(`/patients/${patientId}/files`)
  return Response.json(res.data)
}

/* UPLOAD */
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get("patientId")

  const session = await getSession()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  api.defaults.headers.Authorization = `Bearer ${session.accessToken}`

  const formData = await req.formData()
  const res = await api.post(`/patients/${patientId}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })

  return Response.json(res.data)
}

/* DELETE */
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get("patientId")
  const fileId = searchParams.get("fileId")

  const session = await getSession()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  api.defaults.headers.Authorization = `Bearer ${session.accessToken}`
  await api.delete(`/patients/${patientId}/files/${fileId}`)
  return Response.json({ ok: true })
}

/* PATCH */
export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get("patientId")
  const fileId = searchParams.get("fileId")

  const session = await getSession()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  api.defaults.headers.Authorization = `Bearer ${session.accessToken}`
  const res = await api.patch(`/patients/${patientId}/files/${fileId}`, body)
  return Response.json(res.data)
}

/* DOWNLOAD */
export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get("patientId")
  const fileId = searchParams.get("fileId")

  const session = await getSession()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  api.defaults.headers.Authorization = `Bearer ${session.accessToken}`
  const res = await api.get(`/patients/${patientId}/files/${fileId}/download`)
  return Response.json(res.data)
}
