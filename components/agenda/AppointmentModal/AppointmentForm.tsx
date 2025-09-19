"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

import { DialogFooter } from "@/components/ui/dialog"
import { IAppointmentForm } from "./types"
import { useAppointmentForm } from "@hooks/useAppointmentForm"
import { FormPatientField } from "./FormPatientField"
import { FormDateField } from "./FormDateField"
import { FormTimeFields } from "./FormTimeFields"
import { FormNotesField } from "./FormNotesField"

export default function AppointmentForm({ onSubmit, onCancel, selectedDate, editingAppointment }: IAppointmentForm) {
  const { form } = useAppointmentForm({ selectedDate, editingAppointment, onSubmit })

  const handleSubmit = (data: any) => {
    onSubmit(data)
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormPatientField form={form} initialPatientName={editingAppointment?.patient?.name} />
        <FormDateField form={form} />
        <FormTimeFields form={form} />
        <FormNotesField form={form} />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">{editingAppointment ? "Salvar Alterações" : "Agendar Consulta"}</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
