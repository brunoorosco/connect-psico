"use client"

import { useEffect, useState } from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPatientsByProfessionalId } from "@/actions/patients"
import { Patient } from "@/types/appointment"
import { IFormPatientField } from "./types"

type Props = IFormPatientField & {
  patient?: { name: string; id: string }
  edit: boolean
}

export const FormPatientField: React.FC<Props> = ({ form, patient, edit }) => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const list = await getPatientsByProfessionalId()
        if (Array.isArray(list)) setPatients(list)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (edit && patient?.id && !form.getValues("patientId")) {
      form.setValue("patientId", patient.id)
    }
  }, [edit, patient])

  return (
    <FormField
      control={form.control}
      name="patientId"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Paciente</FormLabel>

          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={edit || loading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue
                  className="text-left"
                  placeholder={edit ? patient?.name : loading ? "Carregando pacientes..." : "Selecione um paciente"}
                />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {!loading &&
                patients.map((p: any) => (
                  <SelectItem key={p.userId ?? p.id} value={String(p.userId ?? p.id)}>
                    <div className="flex flex-col text-left">
                      <span className="text-base">{p.name}</span>
                      <span className="text-xs -mt-1 text-muted-foreground">
                        {p.medicalRecordId ? `Prontuário: ${p.medicalRecordId}` : "Sem prontuário"}
                      </span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
