"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@components/ui"
import { useState } from "react"

const CancelAppointmentDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  selectedId,
  setSelectedId,
  onConfirmCancel,
}: {
  isDialogOpen: boolean
  setIsDialogOpen: (value: boolean) => void
  selectedId: number | null
  setSelectedId: (value: number | null) => void
  onConfirmCancel: (id: number, reason: string) => void
}) => {
  const [reason, setReason] = useState("")
  const [touched, setTouched] = useState(false)

  const MIN_LENGTH = 15
  const isValid = reason.trim().length >= MIN_LENGTH

  const handleConfirm = () => {
    if (!selectedId || !isValid) return
    onConfirmCancel(selectedId, reason.trim())
    resetDialog()
  }

  const handleClose = () => resetDialog()

  const resetDialog = () => {
    setReason("")
    setSelectedId(null)
    setTouched(false)
    setIsDialogOpen(false)
  }

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent className="max-w-sm w-[90%] p-4 rounded-2xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-center">Confirmar cancelamento</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-center text-gray-600">
            Tem certeza que deseja cancelar esta consulta?
            <br />
            Caso haja devolução, o valor será reembolsado em até <strong>3 dias úteis</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-3 space-y-1">
          <Textarea
            placeholder="Motivo do cancelamento (mín. 15 caracteres)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            required
            className={`resize-none h-28 text-sm ${
              touched && !isValid ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />
          {touched && !isValid && (
            <span className="text-xs text-red-500">O motivo deve conter ao menos {MIN_LENGTH} caracteres.</span>
          )}
        </div>

        <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleClose} className="w-full bg-gray-100 text-gray-700">
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isValid}
            className={`w-full transition ${!isValid ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Confirmar cancelamento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default CancelAppointmentDialog
