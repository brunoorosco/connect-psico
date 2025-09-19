// FormPatientField.tsx
"use client"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { IFormPatientField } from "./types"
import { getPatientsByProfessionalId } from "@/actions/patients"
import { Patient } from "@/types/appointment"

type Props = IFormPatientField & {
  initialPatientName?: string; // <- NOVO
}

export const FormPatientField: React.FC<Props> = ({ form, initialPatientName }) => {
  const [open, setOpen] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    (async () => {
      try {
        const patientsList = await getPatientsByProfessionalId()
        if (Array.isArray(patientsList)) setPatients(patientsList)
      } catch {
        // opcional: tratar erro
      }
    })()
  }, [])

  return (
    <FormField
      control={form.control}
      name="patientId"
      render={({ field }) => {
        const selected = patients.find(
          (p: any) => (p.userId ?? p.id) === field.value // <- aceita userId ou id
        )
        const buttonLabel = selected?.name ?? initialPatientName ?? "Selecione um paciente"

        return (
          <FormItem className="flex flex-col">
            <FormLabel>Paciente</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                  >
                    {buttonLabel}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar paciente..." />
                  <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                  <CommandGroup>
                    {patients.map((patient: any) => {
                      const value = patient.userId ?? patient.id
                      return (
                        <CommandItem
                          key={value}
                          value={value}
                          onSelect={() => {
                            field.onChange(value)
                            setOpen(false)
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", value === field.value ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span>{patient.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {patient.medicalRecordId ? `Prontuário: ${patient.medicalRecordId}` : "Sem prontuário vinculado"}
                            </span>
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
