// app/(private)/forms/identification/page.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useTransition } from "react"
import { IdentificationData, IdentificationSchema } from "@components/forms/schema"
import { IdentificationForm } from "@components/forms/identification"

export default function Page() {
  const form = useForm<IdentificationData>({
    resolver: zodResolver(IdentificationSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  })
  const [isPending, startTransition] = useTransition()

  const onSubmit = async (data: IdentificationData) => {
    // chame uma server action ou API route
    await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formType: "IDENTIFICATION",
        answers: data,
      }),
    })
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Ficha de Identificação</h1>
      <IdentificationForm form={form} onSubmit={(d) => startTransition(() => onSubmit(d))} isEdit={false} />
    </div>
  )
}
