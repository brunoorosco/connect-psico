import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, MessageCircle, Calendar as CalendarIcon, DollarSign, User2, BookCopyIcon } from "lucide-react"
import { ProfessionalModel } from "@/domain/model/professional"
import { TextMessage } from "./TextMessage"
import { CalendarProfessional } from "./CalendarProfessional"

interface ProfessionalDetailsModalProps {
  professional: ProfessionalModel | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ProfessionalDetailsModal: React.FC<ProfessionalDetailsModalProps> = ({
  professional,
  open,
  onOpenChange,
}) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("schedule")
  // Reset state when modal opens or professional changes
  useEffect(() => {
    if (open && professional) {
      setAvailableSlots([])
      setSelectedSlot(null)
    }
  }, [open, professional])

  if (!professional) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url(${professional.image || "/placeholder.svg"})` }}
            />
            <div>
              <DialogTitle className="text-xl">{professional.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                <a
                  href={`/terapeutas/${professional.username}`}
                  className="underline underline-offset-2 hover:text-primary"
                >
                  Mais informações
                </a>
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-justify">
                {professional.bio.length > 500 ? `${professional.bio.slice(0, 497)}...` : professional.bio}
              </p>

              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-therapy-primary" />
                  <span className="text-sm">
                    Atendimento:{" "}
                    {professional.tipoAtendimento === "remoto"
                      ? "Online"
                      : professional.tipoAtendimento === "presencial"
                      ? "Presencial"
                      : "Online e Presencial"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-therapy-primary" />
                  <span className="text-sm">
                    {(Number(professional?.valorAtendimento) / 100).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                    / sessão
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookCopyIcon className="h-4 w-4 text-therapy-primary" />
                  <h4 className="font-medium">Especialidade:</h4>
                </div>
                <ul className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm line-clamp-3 overflow-hidden">
                  {professional.especialidade.map((target, idx) => (
                    <li key={idx} className="before:content-['–'] before:mr-2">
                      {target}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <User2 className="h-4 w-4 text-therapy-primary" />
                  <h4 className="font-medium">Público Alvo:</h4>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  {professional.publicoAlvo.map((target, idx) => (
                    <li key={idx} className="before:content-['–'] before:mr-2">
                      {target}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 ">
              <TabsTrigger value="schedule">
                <CalendarIcon className="h-4 w-4 mr-2 cursor-pointer" /> Agendar Consulta
              </TabsTrigger>
              <TabsTrigger value="message">
                <MessageCircle className="h-4 w-4 mr-2 cursor-pointer" /> Enviar Mensagem
              </TabsTrigger>
            </TabsList>

            <CalendarProfessional professionalData={professional} />
            <TextMessage professional={professional} />
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
