import { bffError } from "@/infra/httpClient/bff-response"
import { axiosInstance } from "@/infra/httpClient/psicomaisApiMessage"
import { getSession } from "next-auth/react"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    const session = await getSession()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const res = await axiosInstance.get(`/appointments/patients/${id}`)

    if (process.env.NODE_ENV !== "production") console.debug("[BFF:LIST]", res.status, res.data)
    return Response.json(res.data, { status: res.status })
  } catch (error) {
    return bffError(error, "LIST")
  }
}
