"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, MessageSquare, SquarePlay } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Patient } from "@/types/appointment"

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
        <TooltipContent className="text-gray-50">
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
        <TooltipContent className="text-gray-50">
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
        <TooltipContent className="text-gray-50">
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
        <TooltipContent className="text-gray-50">
          <p>Excluir Paciente</p>
        </TooltipContent>
      </Tooltip>
    </>
  )
}
