"use client"
import React, { useEffect, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { getPatientsByProfessionalId } from "@/actions/patients"
import type { Patient } from "@/types/appointment"
import type { IFormPatientField } from "./types"
import type { AppointmentPatient } from "@/domain/model/appointment"

type Props = IFormPatientField & {
  patient?: AppointmentPatient
  edit: boolean
}

export const FormPatientField: React.FC<Props> = ({ form, patient, edit }) => {
  const [open, setOpen] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (edit) {
      console.log(patient)
      form.setValue("patientId", String(patient?.id))
    }
    const fetchPatients = async () => {
      try {
        const patientsList = await getPatientsByProfessionalId()
        if (Array.isArray(patientsList)) {
          setPatients(patientsList)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

  // ✅ Define o patientId no modo edit
  useEffect(() => {
    if (edit && patient?.id) {
      form.setValue("patientId", patient.id, { shouldValidate: false })
    }
  }, [edit, patient?.id, form])

  return (
    <FormField
      control={form.control}
      name="patientId"
      render={({ field }) => {
        const selected = patients.find((p: any) => (p.userId ?? p.id) === field.value)
        const buttonLabel = selected?.name ?? patient?.name ?? "Selecione um paciente"

        return (
          <FormItem className="flex flex-col">
            <FormLabel>Paciente</FormLabel>

            <Popover open={open && !edit} onOpenChange={setOpen} modal={true}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={edit}
                    className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                  >
                    {buttonLabel}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>

              {!edit && (
                <PopoverContent className="w-[400px] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                  <Command shouldFilter={true}>
                    <CommandInput placeholder="Buscar paciente..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>{loading ? "Carregando..." : "Nenhum paciente encontrado."}</CommandEmpty>

                      <CommandGroup className="max-h-[300px] overflow-auto">
                        {patients.map((patient: any) => {
                          const patientId = patient.id
                          const patientName = patient.name || `Paciente ${patientId}`
                          const isSelected = patientId === field.value

                          return (
                            <CommandItem
                              key={patientId}
                              value={patientName}
                              keywords={[patientName, patient.medicalRecordId].filter(Boolean)}
                              onSelect={() => {
                                field.onChange(patientId)
                                setOpen(false)
                              }}
                              className="cursor-pointer"
                            >
                              <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium truncate">{patientName}</span>
                                {patient.medicalRecordId && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    Prontuário: {patient.medicalRecordId}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              )}
            </Popover>

            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export default FormPatientField
