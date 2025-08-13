"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { usePatientRecords } from "@hooks/useConsultation"
import { NotePatient } from "@/domain/model/notePatient"

type PatientRecordsTabProps = {
  patientId: string
}

type RecordItem = NotePatient & { professional: { name: string } }

export const PatientRecordsTab: React.FC<PatientRecordsTabProps> = ({ patientId }) => {
  const { records, fetchPatientRecords, loading } = usePatientRecords()
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
          {records.map((rec: RecordItem) => (
            <div key={rec.id} className="border-b pb-2 mb-2">
              <p className="text-sm text-gray-600">
                {format(rec.createdAt as Date, "dd/MM/yyyy HH:mm")} — {rec.professional.name}
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
