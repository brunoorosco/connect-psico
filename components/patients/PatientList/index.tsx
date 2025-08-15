"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePatientList } from "@/hooks/usePatientList"
import { IPatientList } from "./types"
import { usePatientStore } from "@/infra/stores/usePatientStore"
import { Patient } from "@/types/appointment"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog"
import { useState } from "react"
import { formatMessageTime } from "@/utils/formatMessageTime"
import { useChatStore } from "@/infra/stores/useChatStore"
import { useCurrentUser } from "@hooks/use-current-user"
import { ChatFooter } from "./chatFooter"
import { PatientActions } from "./buttonsActions"
import { MessageDialog } from "../DialogMessagePatient"

export default function PatientList({ patients, onViewPatient, onEditPatient, onDeletePatient }: IPatientList) {
  const { handleView, handleEdit, handleDelete } = usePatientList({
    onViewPatient,
    onEditPatient,
    onDeletePatient,
  })
  const { messages } = useChatStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const user = useCurrentUser()

  const handleStartConsultation = (item: Patient) => {
    usePatientStore.getState().setPatient(item)
  }

  const handleOpenMessageModal = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsDialogOpen(true)
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Pacientes ({patients.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabela para desktop */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Prontuário</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-100 cursor-pointer" onClick={() => handleView(item)}>
                  <TableCell className="font-medium uppercase py-2">{item.name}</TableCell>
                  <TableCell className="py-2">{item.email || "-"}</TableCell>
                  <TableCell className="py-2">{item.phone || "-"}</TableCell>
                  <TableCell className="py-2">{item.medicalRecordId || "-"}</TableCell>
                  <TableCell className="text-right py-3">
                    <div className="flex justify-end space-x-2">
                      <PatientActions
                        item={item}
                        onStart={handleStartConsultation}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onSendMessage={handleOpenMessageModal}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Lista para mobile */}
        <div className="md:hidden space-y-2">
          {patients.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 bg-white shadow-sm" onClick={() => handleView(item)}>
              <div className="text-lg font-semibold uppercase">{item.name}</div>
              <div className="text-sm text-gray-600 mt-1">Email: {item.email || "-"}</div>
              <div className="text-sm text-gray-600">Telefone: {item.phone || "-"}</div>
              <div className="text-sm text-gray-600">Prontuário: {item.medicalRecordId || "-"}</div>
              <div className="flex justify-end space-x-2 mt-3">
                <PatientActions
                  item={item}
                  onStart={handleStartConsultation}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSendMessage={handleOpenMessageModal}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Nenhum paciente */}
        {patients.length === 0 && (
          <div className="text-center py-8 text-gray-500">Nenhum paciente cadastrado ainda.</div>
        )}
      </CardContent>
      <MessageDialog patient={selectedPatient} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </Card>
  )
}
