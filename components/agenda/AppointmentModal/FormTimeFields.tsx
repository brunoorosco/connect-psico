"use client"

import { useEffect } from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { IFormPatientField } from "./types"

type Props = IFormPatientField

export const FormTimeFields: React.FC<Props> = ({ form }) => {
  const startTime = form.watch("startTime")

  useEffect(() => {
    if (startTime) {
      const [h, m] = startTime.split(":").map(Number)

      const date = new Date()
      date.setHours(h)
      date.setMinutes(m + 59)

      const endH = String(date.getHours()).padStart(2, "0")
      const endM = String(date.getMinutes()).padStart(2, "0")

      form.setValue("endTime", `${endH}:${endM}`)
    }
  }, [startTime, form])

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="startTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Horário de Início</FormLabel>
            <FormControl>
              <Input type="time" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="endTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Horário de Término</FormLabel>
            <FormControl>
              <Input type="time" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
