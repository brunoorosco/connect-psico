"use client"
import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

import { DialogFooter } from "@/components/ui/dialog"
import { IAppointmentForm } from "./types"
import { useAppointmentForm } from "@hooks/useAppointmentForm"
import { FormDateField } from "./FormDateField"
import { FormTimeFields } from "./FormTimeFields"
import { FormNotesField } from "./FormNotesField"
import { FormPatientField } from "./FormPatientField"

export default function AppointmentForm({ onSubmit, onCancel, selectedDate, editingAppointment }: IAppointmentForm) {
  const { form } = useAppointmentForm({ selectedDate, editingAppointment, onSubmit })

  const handleSubmit = (data: any) => {
    if (editingAppointment && editingAppointment.patient?.id && !data.patientId) {
      data.patientId = editingAppointment.patient.id
    }

    onSubmit(data)
  }

 useEffect(() => {
  if (editingAppointment) {
    form.setValue("id", editingAppointment.id)
  }
}, [editingAppointment])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {editingAppointment && <input type="hidden" {...form.register("id")} />}
        <FormPatientField
          form={form}
          patient={{
            id: editingAppointment?.patientId as string, // garante que o ID vem da consulta
            name: editingAppointment?.patient?.name ?? "",
          }}
          edit={!!editingAppointment}
        />
        <FormDateField form={form} />
        <FormTimeFields form={form} />
        <FormNotesField form={form} />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button className="text-gray-50" type="submit">
            {editingAppointment ? "Salvar Alterações" : "Agendar Consulta"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
