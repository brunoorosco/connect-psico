import { useRef, useState, ChangeEvent, FormEvent } from "react"
import { Image, Send, X, Link2, Smile } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useChatStore } from "@/infra/stores/useChatStore"

const MessageInput = () => {
  const [text, setText] = useState<string>("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { sendMessage, selectedUser } = useChatStore()
  const { data: session } = useSession()

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() && !imagePreview) return
    if (!selectedUser?.userId) {
      toast.error("Nenhum contato selecionado")
      return
    }

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview || "",
        receiverId: selectedUser.userId,
        senderId: session?.user?.id || "",
      })
      setText("")
      removeImage()
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const canSend = Boolean(text.trim() || imagePreview)

  return (
    <div className="p-4 w-full">
      {/* Preview da imagem anexada */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-25 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
              aria-label="Remover imagem"
              title="Remover imagem"
            >
              <X className="w-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage}>
        <div className="py-3">
          <div className="relative w-full">
            <input
              type="text"
              className="w-full border-2 border-gray-300 rounded-lg h-12 pl-3 pr-28 
                        text-base focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Digite uma mensagem..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  // chama o submit do form
                  ;(e.currentTarget.form as HTMLFormElement)?.requestSubmit()
                }
              }}
              aria-label="Mensagem"
            />

            {/* Ações dentro do input */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {/* Link (placeholder para futura UI) */}
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-base-200"
                title="Inserir link"
                aria-label="Inserir link"
                onClick={() => toast.info("Em breve: inserção de links 🤝")}
              >
                <Link2 className="w-5 h-5 text-gray-600" />
              </button>

              {/* Emoji (placeholder para futura UI) */}
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-base-200"
                title="Emojis"
                aria-label="Abrir emojis"
                onClick={() => toast.info("Em breve: seletor de emojis 😄")}
              >
                <Smile className="w-5 h-5 text-gray-600" />
              </button>

              {/* Input de arquivo escondido */}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

              {/* Botão de imagem */}
              <button
                type="button"
                className={`p-1.5 rounded-full hover:bg-base-200 ${
                  imagePreview ? "text-emerald-500" : "text-zinc-400"
                }`}
                title="Anexar imagem"
                aria-label="Anexar imagem"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="w-5 h-5 text-gray-600" />
              </button>

              {/* Enviar */}
              <button
                type="submit"
                title="Enviar"
                aria-label="Enviar"
                className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-100 disabled:opacity-40"
                disabled={!canSend}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dica de teclado */}
          <div className="mt-1 text-[11px] text-zinc-400">
            Pressione <kbd className="px-1 py-0.5 border rounded">Enter</kbd> para enviar •{" "}
            <kbd className="px-1 py-0.5 border rounded">Shift</kbd> +{" "}
            <kbd className="px-1 py-0.5 border rounded">Enter</kbd> para quebrar linha
          </div>
        </div>
      </form>
    </div>
  )
}

export default MessageInput
