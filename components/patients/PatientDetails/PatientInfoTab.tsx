"use client"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IPatient } from "./types"
import { format, parseISO } from "date-fns"
import { formatPhone } from "@/utils/formatPhone"
import { formatAddress } from "@/utils/formatAddress"

export const PatientInfoTab: React.FC<IPatient> = (props) => {
  const { patient } = props || {}

  if (!patient) {
    return <p>Carregando informações do paciente...</p>
  }

  const { email, phone, birthDate, emergencyContact, street, number, neighborhood, city, state, cep, notes } = patient

  const formattedAddress = formatAddress(street, number, neighborhood, city, state, cep)
  const parsedDate = birthDate ? parseISO(birthDate) : ""
  const formattedDate = parsedDate ? format(parsedDate, "dd/MM/yyyy") : "-"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Email" value={email} />
          <InfoField label="Telefone" value={formatPhone(phone)} />
          <InfoField label="Data de Nascimento" value={formattedDate ?? "-"} />
          <InfoField label="Contato de Emergência" value={emergencyContact || "Não informado"} />
          <InfoField label="Endereço" value={formattedAddress} fullWidth />
          <InfoField label="Observações" value={notes || "Sem observações"} fullWidth />
        </div>
      </CardContent>
    </Card>
  )
}
const InfoField = ({ label, value, fullWidth = false }: { label: string; value?: string; fullWidth?: boolean }) => (
  <div className={fullWidth ? "md:col-span-2" : ""}>
    <label className="text-sm font-medium text-gray-500">{label}</label>
    <p>{value || "-"}</p>
  </div>
)
