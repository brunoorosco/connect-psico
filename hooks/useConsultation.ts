import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import * as z from "zod"
import { Consultation } from "@/domain/model/consultation"
import createConsultation from "@/actions/consultation/addConsultation"
import { getConsultaltionByPatientId } from "@/actions/consultation"
import { useState, useTransition, useCallback, useRef } from "react"
import { NotePatient } from "@/domain/model/notePatient"
import { axiosInstance } from "@/infra/httpClient/psicomaisApiMessage"

// ─── Schema do formulário ───────────────────────────────────────
const schema = z.object({
  patientId: z.number(),
  notes: z.string(),
  prescription: z.string().optional(),
  professionalId: z.string(),
  summaryIdMongo: z.string(),
})

export type ConsultationFormData = z.infer<typeof schema>

interface UseConsultationFormProps {
  notePatient?: Consultation | null
  onSubmit?: (data: Omit<Consultation, "id" | "createdAt">) => void
}

export function useConsultationForm({ notePatient, onSubmit }: UseConsultationFormProps) {
  const { data: session } = useSession()

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      summaryIdMongo: notePatient?.summaryIdMongo ?? "",
      notes: notePatient?.notes || "",
      patientId: notePatient?.patientId ?? 0,
      prescription: notePatient?.prescription || "",
      professionalId: session?.user?.id || "",
    },
  })

  const handleSubmit = async (data: ConsultationFormData) => {
    try {
      await createConsultation(data)
      toast.success("Consulta finalizada com sucesso!")
      form.reset()
      if (onSubmit) onSubmit(data)
    } catch (error) {
      toast.error("Erro ao salvar consulta.")
      console.error("Erro ao salvar consulta:", error)
    }
  }

  return { form, handleSubmit }
}

// ─── Types do MongoDB (retorno real da API) ─────────────────────
export type MongoSummaryKeyPoints = {
  positives?: string[]
  negatives?: string[]
}

export type MongoSummaryResult = {
  summary: string
  key_points?: MongoSummaryKeyPoints
  action_items?: string[]
  warnings?: string[]
}

export type MongoSessionData = {
  _id: string
  userId: string
  sessionId: string
  text: string
  summary: MongoSummaryResult
  createdAt: string
  updatedAt: string
  patientId: string
}

// ─── Types do Prisma (retorno da consulta principal) ────────────
type RecordItem = NotePatient & { professional: { name: string } }

type PropsUsePatientRecords = {
  records: RecordItem[]
  fetchPatientRecords: (patientId: string) => Promise<void>
  loading: boolean
  sessionCache: Map<string, MongoSessionData>
  fetchSessionById: (mongoId: string) => Promise<void>
  loadingSessionIds: Set<string>
}

export function usePatientRecords(): PropsUsePatientRecords {
  const [records, setRecords] = useState<RecordItem[]>([])
  const [loading, startTransition] = useTransition()
  const [sessionCache, setSessionCache] = useState<Map<string, MongoSessionData>>(new Map())
  const [loadingSessionIds, setLoadingSessionIds] = useState<Set<string>>(new Set())

  // ref para evitar closure velha no useCallback
  const cacheRef = useRef(sessionCache)
  cacheRef.current = sessionCache

  const fetchPatientRecords = async (patientId: string) => {
    try {
      startTransition(() => {
        getConsultaltionByPatientId(patientId).then((res) => {
          setRecords(res.data ?? [])
        })
      })
    } catch (error) {
      toast.error("Erro ao buscar prontuário.")
      console.error("Erro ao buscar prontuário:", error)
    }
  }

  // Busca individual — só ao expandir o card
  const fetchSessionById = useCallback(async (mongoId: string) => {
    if (cacheRef.current.has(mongoId)) return

    setLoadingSessionIds((prev) => new Set(prev).add(mongoId))

    try {
     const res = await axiosInstance.get<MongoSessionData>(`/sessions/${mongoId}`)

      setSessionCache((prev) => {
        const next = new Map(prev)
        next.set(mongoId, res.data)
        return next
      })
    } catch (error) {
      toast.error("Não foi possível carregar os detalhes da sessão")
      console.error("Erro ao buscar sessão:", error)
    } finally {
      setLoadingSessionIds((prev) => {
        const next = new Set(prev)
        next.delete(mongoId)
        return next
      })
    }
  }, [])

  return {
    records,
    fetchPatientRecords,
    loading,
    sessionCache,
    fetchSessionById,
    loadingSessionIds,
  }
}
