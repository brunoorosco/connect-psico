import { useSession } from "next-auth/react";
import { useTransition } from "react";
import { composeSlotISO } from "./helpers";
import { Button } from "@components/ui";
import { Calendar } from "lucide-react";

export function BookButton({
    professionalId,
    selected,
    onBooked,
  }: {
    professionalId: string | number
    selected: { ymd: string; time: string } | null
    onBooked?: () => void
  }) {
    const { status } = useSession()
    const isLogged = status === "authenticated"
    const [isPending, startTransition] = useTransition()
  
    const disabled = !isLogged || !selected || isPending
  
    // Submissão via Server Action (form)
    const iso = selected ? composeSlotISO(selected.ymd, selected.time) : ""
  
    async function clientSubmit(e: React.FormEvent) {
      e.preventDefault()
      if (!selected) return
      // Exemplo de chamada para uma rota api se preferir, enquanto a action não está criada
      // await fetch("/api/appointments", { method: "POST", body: JSON.stringify({ professionalId, isoDate: iso }) })
      // Se for usar server action:
      // startTransition(async () => {
      //   const res = await bookAppointmentAction(formData) // import do server
      //   if (res?.ok) onBooked?.();
      // });
      startTransition(async () => {
        // Placeholder
        await new Promise((r) => setTimeout(r, 600))
        onBooked?.()
      })
    }
  
    return (
      <form onSubmit={clientSubmit} className="w-full">
        {/* Hidden fields para futura Server Action */}
        <input name="professionalId" defaultValue={String(professionalId)} hidden readOnly />
        <input name="isoDate" defaultValue={iso} hidden readOnly />
        <Button type="submit" className="w-full" disabled={disabled}>
          <Calendar className="h-4 w-4 mr-2" />
          {isPending ? "Agendando..." : "Agendar Consulta"}
        </Button>
      </form>
    )
  }