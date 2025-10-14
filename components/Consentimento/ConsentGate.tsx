// components/consentimento/ConsentGate.tsx
"use client"

import { useState, useTransition } from "react"
import { ConsentDialog } from "./ConsentDialog"
import { toast } from "sonner"

type Props = {
  shouldOpen: boolean
  acceptAction: (payload: FormData) => Promise<void>
  declineAction: (payload: FormData) => Promise<void>
}

export default function ConsentGate({ shouldOpen, acceptAction, declineAction }: Props) {
  const [open, setOpen] = useState(shouldOpen)
  const [pending, startTransition] = useTransition()

  const onAccept = () => {
    startTransition(async () => {
      try {
        const fd = new FormData()
        fd.set("consentVersion", "v1")
        await acceptAction(fd)
        
        toast.success("Consentimento registrado. Bem-vindo!")
        setOpen(false)
      } catch (e: any) {
        toast.error("Não foi possível registrar seu consentimento.")
      }
    })
  }

  const onDecline = () => {
    startTransition(async () => {
      try {
        const fd = new FormData()
        fd.set("consentVersion", "v1")
        await declineAction(fd)
        toast("Consentimento recusado", { description: "O atendimento seguirá sem gravação." })
        setOpen(false)
      } catch (e: any) {
        toast.error("Não foi possível registrar sua escolha.")
      }
    })
  }

  return <ConsentDialog open={open} onAccept={onAccept} onDecline={onDecline} />
}
