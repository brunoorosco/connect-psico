"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, MessageSquare, SquarePlay } from "lucide-react"
import { usePatientList } from "@/hooks/usePatientList"
import { IPatientList } from "./types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
import ChatFooter from "./chatFooter"
import { formatMessageTime } from "@/utils/formatMessageTime"
import { useChatStore } from "@/infra/stores/useChatStore"
import { useCurrentUser } from "@hooks/use-current-user"

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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl w-full h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Enviar Mensagem</DialogTitle>
            <DialogDescription>Enviar mensagem para {selectedPatient?.name}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto border rounded-md p-4 space-y-4 bg-muted">
            {messages &&
              messages
                .filter((msg) => msg.receiverId === selectedPatient?.userId || msg.senderId === selectedPatient?.userId)
                .map((msg) => {
                  const isCurrentUser = msg.senderId === user?.id
                  return (
                    <div key={msg._id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      <div className="bg-white p-2 rounded-md shadow-sm max-w-[70%]">
                        <p className="text-sm">{msg.text}</p>
                        <time className="block text-xs text-muted-foreground mt-1">
                          {formatMessageTime(msg.createdAt)}
                        </time>
                      </div>
                    </div>
                  )
                })}
          </div>

          <div className="pt-4 space-y-2">
            <ChatFooter receiverId={selectedPatient?.userId as string} />
            <DialogFooter></DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function PatientActions({
  item,
  onStart,
  onEdit,
  onDelete,
  onSendMessage,
}: {
  item: Patient
  onStart: (item: Patient) => void
  onEdit: (item: Patient) => void
  onDelete: (id: number) => void
  onSendMessage: (item: Patient) => void
}) {
  const router = useRouter()

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onStart(item)
              router.push(`./pacientes/${item.userId}/consulta`)
            }}
          >
            <SquarePlay className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Iniciar Consulta</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(item)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Editar Paciente</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onSendMessage(item)
            }}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Enviar Mensagem</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id) // item.id agora é number
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Excluir Paciente</p>
        </TooltipContent>
      </Tooltip>
    </>
  )
}
