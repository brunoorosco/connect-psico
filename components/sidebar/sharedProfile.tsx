'use client'
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Share2, User } from "lucide-react"
import { toast } from "sonner"

type Props = {
  urlProfile: string
}

export function ShareProfile({ urlProfile }: Props) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(urlProfile)
      toast.success("Link copiado!", {
        description: "O link do seu perfil foi copiado para a área de transferência.",
      })
    } catch (error) {
      toast.error("Erro", {
        description: "Não foi possível copiar o link.",
      })
    }
  }

  return (
    <DropdownMenuItem onClick={handleCopy}>
      <Share2 className="w-4 h-4 mr-2" />
      Compartilhar Perfil
    </DropdownMenuItem>
  )
}
