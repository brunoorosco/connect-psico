"use client"
import { useChatStore } from "@/infra/stores/useChatStore"
import { useCurrentUser } from "@hooks/use-current-user"
import { Link2, Smile, SendHorizonal, Image, X } from "lucide-react"
import { ChangeEvent, FormEvent, useRef, useState } from "react"
import { toast } from "sonner"

interface Props {
  receiverId: string
}
export const ChatFooter = ({ receiverId }: Props) => {
  const [text, setText] = useState<string>("")
  const [message, setMessage] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { sendMessage, selectedUser } = useChatStore()
  const user = useCurrentUser()

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() && !imagePreview) return
    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview || "",
        receiverId: receiverId,
        senderId: user?.id || "",
      })
      setText("")
      removeImage()
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  return (
    <div className="p-4 w-full">
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
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
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
              placeholder="Digite uma mensagem"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              className="w-full border border-gray-300 rounded-sm py-2 pl-4 pr-28 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />

            {/* Botões dentro do input */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button title="Inserir link" className="p-1.5 hover:bg-gray-100 rounded-full">
                <Link2 className="w-5 h-5 text-gray-600" />
              </button>
              <button title="Emojis" className="p-1.5 hover:bg-gray-100 rounded-full">
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
              <button
                type="button"
                className={`${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="w-5 h-5 text-gray-600" />
              </button>
              <button
                type="submit"
                title="Enviar"
                className="p-1.5 hover:bg-indigo-100 rounded-full text-indigo-600 disabled:opacity-40"
                disabled={!message.trim()}
              >
                <SendHorizonal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ChatFooter