// components/PatientActions.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, MessageSquare, Video, Paperclip } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Patient } from "@/types/appointment"
import { UploadFileDialog } from "../UploadDileDialog"

export function PatientActions({
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
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setUploadDialogOpen(true)
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onStart(item)
              router.push(`./pacientes/${item.userId}/consulta`)
            }}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Video className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-gray-50">
          <p>Iniciar Consulta</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(item)
            }}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-gray-50">
          <p>Editar Paciente</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onSendMessage(item)
            }}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-gray-50">
          <p>Enviar Mensagem</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUploadClick}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-gray-50">
          <p>Anexar Arquivo</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-gray-50">
          <p>Excluir Paciente</p>
        </TooltipContent>
      </Tooltip>

      {/* Dialog de Upload */}
      <UploadFileDialog
        patient={item}
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={(file) => {
          console.log("Arquivo enviado:", file)
          // Aqui você pode adicionar lógica adicional, como atualizar uma lista global
        }}
      />
    </>
  )
}
