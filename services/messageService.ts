import { createMessage } from "@/actions/messages"
import { axiosInstanceChatz } from "@/infra/httpClient/chatzMessageApi"
import z from "zod"

type TCreateMessage = {
  senderId: string
  receiverId: string
  content: string
}

export async function createMessageService(data: TCreateMessage) {
  const response = createMessage(data)
  const sendMessage = await axiosInstanceChatz.post("/messages/send", {
    name: "bruno orosco",
    number: "5511940714391",
  })
  console.log(sendMessage)
  return response
}
