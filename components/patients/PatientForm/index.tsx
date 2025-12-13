"use client"

import React, { useEffect, useState } from "react"
import { PatientFormData } from "@/hooks/usePatientForm"
import { Patient } from "@/types/appointment"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import InputMask from "react-input-mask"
import { useCurrentUser } from "@hooks/use-current-user"
import { UseFormReturn } from "react-hook-form"
import { customAlphabet } from "nanoid"
const nanoid = customAlphabet("1234567890", 5)

type Props = {
  patient?: Patient | null
  onSubmit: (data: PatientFormData) => void | Promise<void>
  onCancel: () => void
  form: UseFormReturn<PatientFormData>
  handleCepChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  isEdit: boolean
  reset: (values?: PatientFormData) => void
}

export const PatientForm: React.FC<Props> = ({ patient, onSubmit, onCancel, form, handleCepChange, isEdit, reset }) => {
  const user = useCurrentUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const birthDate = form.watch("birthDate")
  const [isMinor, setIsMinor] = useState(false)

  useEffect(() => {
    if (birthDate) {
      const today = new Date()
      const birth = new Date(birthDate)
      let age = today.getFullYear() - birth.getFullYear()
      const m = today.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      setIsMinor(age < 18)
    } else {
      setIsMinor(false)
    }
  }, [birthDate])

  useEffect(() => {
    if (patient) {
      const birthDateFormatted =
        patient.birthDate && typeof patient.birthDate !== "string"
          ? new Date(patient.birthDate).toISOString().substring(0, 10)
          : patient.birthDate || ""

      reset({
        name: patient.name || "",
        email: patient.email || "",
        phone: patient.phone || "",
        medicalRecordId: patient.medicalRecordId || "",
        birthDate: birthDateFormatted || "",
        emergencyContact: patient.emergencyContact || "",
        notes: patient.notes || "",
        cep: patient.cep || "",
        street: patient.street || "",
        neighborhood: patient.neighborhood || "",
        city: patient.city || "",
        state: patient.state || "",
        number: patient.number || "",
        responsibleName: patient.responsibleName || "",
        responsiblePhone: patient.responsiblePhone || "",
        profissionalId: user?.id,
      })
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        medicalRecordId: `PR-${nanoid()}`,  // Gera novo ID aqui
        birthDate: "",
        responsibleName: "",
        responsiblePhone: "",
        emergencyContact: "",
        notes: "",
        cep: "",
        street: "",
        neighborhood: "",
        city: "",
        state: "",
        number: "",
        profissionalId: user?.id,
      })
    }
  }, [patient, reset, user?.id])

  const internalSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }
  if (!form) {
    return <div>Loading...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(internalSubmit)} className="space-y-4">
        {/* Linha 1 */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-3">
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl>
                  <Input className="uppercase" placeholder="Nome do paciente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-1">
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <InputMask mask="(99) 99999-9999" placeholder="(99) 99999-9999" {...field} onChange={field.onChange}>
                    {(inputProps: any) => <Input {...inputProps} />}
                  </InputMask>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Linha 2 */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Data de Nascimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Contato de Emergência</FormLabel>
                <FormControl>
                  <Input placeholder="Nome e telefone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="medicalRecordId"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Número do Prontuário</FormLabel>
                <FormControl>
                  <Input placeholder="PR-001" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Responsible Contact for Minors */}
        {isMinor && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 border-2 border-yellow-100 p-4 rounded-md bg-yellow-50/10">
            <div className="col-span-full">
              <h4 className="font-semibold text-yellow-600 mb-2">Dados do Responsável (Menor de Idade)</h4>
            </div>
            <FormField
              control={form.control}
              name="responsibleName"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-3">
                  <FormLabel>Nome do Responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="responsiblePhone"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-3">
                  <FormLabel>Telefone do Responsável</FormLabel>
                  <FormControl>
                    <InputMask mask="(99) 99999-9999" placeholder="(99) 99999-9999" {...field} onChange={field.onChange}>
                      {(inputProps: any) => <Input {...inputProps} />}
                    </InputMask>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Linha 3 */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <FormField
            control={form.control}
            name="cep"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <InputMask
                    mask="99999-999"
                    placeholder="00000-000"
                    {...field}
                    onChange={(e: any) => handleCepChange(e)}
                  >
                    {(inputProps: any) => <Input {...inputProps} />}
                  </InputMask>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-3">
                <FormLabel>Rua</FormLabel>
                <FormControl>
                  <Input placeholder="Rua" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-1">
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="Número" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Linha 4 */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input placeholder="Bairro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-3">
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Cidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-1">
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input placeholder="UF" maxLength={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Observações */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Observações adicionais sobre o paciente" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="text-gray-50">
            {" "}
            {isEdit ? "Atualizar" : "Criar"} Paciente
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default PatientForm
