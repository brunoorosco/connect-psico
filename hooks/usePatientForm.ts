// hooks/usePatientForm.ts
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useCallback } from "react"
import { toast } from "sonner"
import { customAlphabet } from "nanoid"
import * as z from "zod"
import { format } from "date-fns"

import { createPatient } from "@/actions/patients/addPatient"
import { updatePatient } from "@/actions/patients/updatePatient"
import { Patient } from "@/types/appointment"

const nanoid = customAlphabet("1234567890", 5)

const schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 5 caracteres"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10).optional().or(z.literal("")),
  medicalRecordId: z.string().optional(),
  birthDate: z.string().optional(),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
  cep: z.string().min(8).optional(),
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  number: z.string().optional(),
  profissionalId: z.string().optional(),
})

export type PatientFormData = z.infer<typeof schema>

export function usePatientForm({ patient, mutate }: { patient?: Patient | null; mutate: () => Promise<any> }) {
  const { data: session } = useSession()

  const generateMedicalRecordId = () => `PR-${nanoid()}`
  const birthDateFormatted: string | undefined = patient?.birthDate
    ? typeof patient.birthDate === "string"
      ? patient.birthDate
      : format(new Date(patient.birthDate), "yyyy-MM-dd")
    : undefined

  const form = useForm<PatientFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: patient?.name || "",
      email: patient?.email || "",
      phone: patient?.phone || "",
      medicalRecordId: generateMedicalRecordId(),
      birthDate: birthDateFormatted,
      emergencyContact: (patient as any)?.emergencyContact || "",
      notes: (patient as any)?.notes || "",
      cep: (patient as any)?.cep || "",
      street: (patient as any)?.street || "",
      neighborhood: (patient as any)?.neighborhood || "",
      city: (patient as any)?.city || "",
      state: (patient as any)?.state || "",
      number: (patient as any)?.number || "",
      profissionalId: session?.user.id || "",
    },
  })

  const handleSubmit = async (data: PatientFormData) => {
    try {
      if (patient) {
        await updatePatient(data.medicalRecordId!, data)
        toast.success("Paciente atualizado com sucesso!")
      } else {
        await createPatient(data)
        toast.success("Paciente criado com sucesso!")
        form.reset()
      }
      await mutate()
    } catch (error) {
      toast.error("Erro ao salvar paciente.")
      console.error("Erro:", error)
    }
  }

  const handleCepChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const cep = e.target.value.replace(/\D/g, "")
      form.setValue("cep", cep)

      if (cep.length === 8) {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
          const data = await response.json()
          if (!data.erro) {
            form.setValue("street", data.logradouro || "")
            form.setValue("neighborhood", data.bairro || "")
            form.setValue("city", data.localidade || "")
            form.setValue("state", data.uf || "")
          }
        } catch (err) {
          console.error("Erro ao buscar CEP:", err)
        }
      }
    },
    [form]
  )

  return { form, handleSubmit, handleCepChange, isEdit: !!patient, reset: form.reset }
}
