"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { usePatientRecords } from "@hooks/useConsultation"
import { NotePatient } from "@/domain/model/notePatient"

interface PatientRecordsTabProps {
  patientId: number
}

export const PatientRecordsTab: React.FC<PatientRecordsTabProps> = ({ patientId }) => {
  const { records, fetchPatientRecords, loading } = usePatientRecords()

console.log("paciente",patientId)
  useEffect(() => {
    fetchPatientRecords(patientId)
  }, [patientId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prontuário Médico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lista de registros */}
        <ScrollArea className="max-h-96 border rounded-md p-2">
          {records.length === 0 && <p className="text-gray-500 text-center py-4">Nenhum registro no prontuário.</p>}
          {records.map((rec: NotePatient) => (
            <div key={rec.id} className="border-b pb-2 mb-2">
              <p className="text-sm text-gray-600">
                {format(rec.createdAt as Date, "dd/MM/yyyy HH:mm")} — {rec.professionalId}
              </p>
              <p className="mt-1 text-gray-800">{rec.notes}</p>
              {rec.prescription && <p className="mt-1 text-blue-600">💊 {rec.prescription}</p>}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
