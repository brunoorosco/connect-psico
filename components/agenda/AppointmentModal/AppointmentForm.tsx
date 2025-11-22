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
import FormPatientField from "./FormPatientField"

export default function AppointmentForm({ onSubmit, onCancel, selectedDate, editingAppointment }: IAppointmentForm) {
  const { form } = useAppointmentForm({ selectedDate, editingAppointment, onSubmit })

  const handleSubmit = (data: any) => {
    console.log("AppointmentForm.tsx:18", data)

    // ✅ SOLUÇÃO: Garante que patientId está presente no modo edit
    if (editingAppointment && editingAppointment.patient?.id && !data.patientId) {
      data.patientId = editingAppointment.patient.id
    }

    onSubmit(data)
  }
  useEffect(() => {
    console.log("🔥 Tipo do patientId:", typeof form.watch("patientId"), form.watch("patientId"))
    console.log(editingAppointment)
  }, [form.watch("patientId")])
  return (
    <Form {...form}>
      {JSON.stringify(form.formState.errors)}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
