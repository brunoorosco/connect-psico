"use client"
import { Share2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  urlProfile: string
  className?: string
  onClick?: () => void // opcional para personalizar
}

export function ShareProfileButton({ urlProfile, className, onClick }: Props) {
  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation() // só chama se existir evento

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
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center w-full p-2 hover:bg-muted rounded ${className || ""}`}
    >
      <Share2 className="w-4 h-4 mr-2" />
      Compartilhar Perfil
    </button>
  )
}
