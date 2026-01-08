import axios from "axios"
import { env } from "@/config/application"
import { getAccessToken } from "@/actions/token/getToken"
import { bffError } from "@/infra/httpClient/bff-response"

const api = axios.create({
  baseURL: env.baseUrlPsicomaisApi + "/api",
  timeout: 60000,
})

async function getSession() {
  return getAccessToken()
}

/* LIST */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get("patientId")

    const session = await getSession()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    api.defaults.headers.Authorization = `Bearer ${session.accessToken}`

    const res = await api.get(`/patients/${patientId}/files`)

    console.info("[BFF:LIST]", res.status, res.data)
    return Response.json(res.data, { status: res.status })
  } catch (error) {
    return bffError(error, "LIST")
  }
}

/* UPLOAD */
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get("patientId")

    const session = await getSession()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await req.formData()
    api.defaults.headers.Authorization = `Bearer ${session.accessToken}`

    const res = await api.post(`/patients/${patientId}/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    console.info("[BFF:UPLOAD]", res.status, res.data)
    return Response.json(res.data, { status: res.status })
  } catch (error) {
    return bffError(error, "UPLOAD")
  }
}

/* DELETE */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get("patientId")
    const fileId = searchParams.get("fileId")

    const session = await getSession()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    api.defaults.headers.Authorization = `Bearer ${session.accessToken}`

    const res = await api.delete(`/patients/${patientId}/files/${fileId}`)
    console.info("[BFF:DELETE]", res.status)

    return Response.json({ ok: true }, { status: res.status })
  } catch (error) {
    return bffError(error, "DELETE")
  }
}

/* PATCH */
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get("patientId")
    const fileId = searchParams.get("fileId")

    const session = await getSession()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    api.defaults.headers.Authorization = `Bearer ${session.accessToken}`

    const res = await api.patch(`/patients/${patientId}/files/${fileId}`, body)
    console.info("[BFF:PATCH]", res.status, res.data)

    return Response.json(res.data, { status: res.status })
  } catch (error) {
    return bffError(error, "PATCH")
  }
}

/* DOWNLOAD */
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get("patientId")
    const fileId = searchParams.get("fileId")

    const session = await getSession()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    api.defaults.headers.Authorization = `Bearer ${session.accessToken}`

    const res = await api.get(`/patients/${patientId}/files/${fileId}/download`)
    console.info("[BFF:DOWNLOAD]", res.status)

    return Response.json(res.data, { status: res.status })
  } catch (error) {
    return bffError(error, "DOWNLOAD")
  }
}
