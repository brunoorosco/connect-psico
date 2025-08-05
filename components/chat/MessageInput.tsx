import { useRef, useState, ChangeEvent, FormEvent } from "react"
import { Image, Send, X } from "lucide-react"
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
        receiverId: selectedUser.userId,
        senderId: session?.user.id || ""
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

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 h-12">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md pl-2"
            placeholder="Digite uma mensagem..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle pt-3
              ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        <button type="submit" className="btn btn-sm btn-circle" disabled={!text.trim() && !imagePreview}>
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}

export default MessageInput
