import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, MessageCircle, Calendar as CalendarIcon, Heart, DollarSign } from "lucide-react";
import { ProfessionalModel } from "@/domain/model/professional";
import { TextMessage } from "./TextMessage";
import { CalendarProfessional } from "./CalendarProfessional";

interface ProfessionalDetailsModalProps {
  professional: ProfessionalModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfessionalDetailsModal: React.FC<ProfessionalDetailsModalProps> = ({
  professional,
  open,
  onOpenChange,
}) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("schedule");

  // Reset state when modal opens or professional changes
  useEffect(() => {
    if (open && professional) {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [open, professional]);

  // Calculate available day names for the professional
  const getAvailableDayNames = () => {
    if (!professional) return [];
    // return professional.availableDays.map((dayValue:any) => {
    //   const day = weekdays.find(d => d.value === dayValue);
    //   return day ? day.label : "";
    // }).join(", ");
  };

  if (!professional) return null;

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
                {/* {professional.especialista.join(", ")} */}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {/* <h4 className="font-medium mb-2">Sobre o profissional</h4> */}
              <p className="text-sm">{professional.bio}</p>

              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-therapy-primary" />
                  <span className="text-sm">
                    Atendimento:{" "}
                    {professional.tipoAtendimento === "remote"
                      ? "Online"
                      : professional.tipoAtendimento === "presential"
                      ? "Presencial"
                      : "Online e Presencial"}
                  </span>
                </div>

                {/* <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-therapy-primary" />
                  <span className="text-sm">{professional.experience} anos de experiência</span>
                </div> */}

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-therapy-primary" />
                  <span className="text-sm">
                    {(Number(professional?.valorAtendimento) / 100).toLocaleString(
                      "pt-BR",
                      { style: "currency", currency: "BRL" }
                    )}{" "}
                    / sessão
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Disponibilidade</h4>
              <p className="text-sm mb-2">
                <span className="font-medium">Dias:</span> {getAvailableDayNames()}
              </p>
              <div className="text-sm">
                <span className="font-medium">Horários:</span>
                {/* {professional.availableHours.map((interval, idx) => (
                  <div key={idx} className="ml-2">
                    {interval.startTime} até {interval.endTime}
                  </div>
                ))} */}
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
  );
};
