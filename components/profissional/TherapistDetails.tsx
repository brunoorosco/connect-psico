// import { useSession } from "next-auth/react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { MessageCircle, Calendar } from "lucide-react";
// import { useState } from "react";
// import { Calendar as CalendarComponent } from "@/components/ui/calendar";
// import { ProfessionalModel } from "./TherapistCard";

// interface TherapistDetailsProps {
//   open: boolean;
//   onClose: () => void;
//   therapist: ProfessionalModel | null;
// }

// export const TherapistDetails = ({ open, onClose, therapist }: TherapistDetailsProps) => {
//   const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
//   const { data: session, status } = useSession();

//   console.log(therapist);

//   if (!therapist) return null;

//   return (
//     <Dialog open={open} onOpenChange={() => onClose()}>
//       <DialogContent className="max-w-3xl">
//         <DialogHeader>
//           <DialogTitle>Detalhes do Profissional</DialogTitle>
//         </DialogHeader>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <div className="flex items-center gap-4 mb-4">
//               <img
//                 src={therapist?.image}
//                 alt={therapist?.name}
//                 className="w-20 h-20 rounded-full object-cover"
//               />
//               <div>
//                 <h3 className="text-xl font-semibold">{therapist?.name}</h3>
//                 <p className="text-sm text-muted-foreground">
//                   {therapist?.Professional[0].publicoAlvo}
//                 </p>
//               </div>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <h4 className="text-xl font-semibold">Especialista</h4>
//                 <p className="text-sm text-muted-foreground">
//                   {therapist?.Professional[0].especialidade.join(",  ")}
//                 </p>
//               </div>
//               <div>
//                 <h4 className="text-xl font-semibold">Bio</h4>
//                 <p className="text-sm text-muted-foreground">{therapist?.Professional[0].bio}</p>
//               </div>
//               <div>
//                 <h4 className="font-semibold mb-2">Formação</h4>
//                 <ul className="list-disc list-inside text-sm">
//                   {therapist?.Professional[0].education}
//                 </ul>
//               </div>
//               <div>
//                 <h4 className="font-semibold mb-2">Idiomas</h4>
//                 //
//                 {/* <p className="text-sm">{therapist.languages.join(", ")}</p> */}
//               </div>
//               <div>
//                 <h4 className="font-semibold mb-2">Abordagem</h4>
//                 <p className="text-sm">{therapist?.Professional[0].abordagem}</p>
//               </div>
//               <div className="flex gap-2">
//                 <Button className="flex-1" disabled={status === "unauthenticated"}>
//                   <Calendar className="w-4 h-4 mr-2" />
//                   Agendar
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="flex-1"
//                   disabled={status === "unauthenticated"}
//                 >
//                   <MessageCircle className="w-4 h-4 mr-2" />
//                   Mensagem
//                 </Button>
//               </div>
//             </div>
//           </div>
//           <div>
//             <h4 className="font-semibold mb-4">Disponibilidade</h4>
//             <CalendarComponent
//               mode="single"
//               selected={selectedDate}
//               onSelect={setSelectedDate}
//               className="rounded-md border"
//             />
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays, isAfter, isBefore, isSameDay, set, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

import { MapPin, MessageCircle, Calendar as CalendarIcon, Heart, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { weekdays } from "@/schemas/PsicologoProfileSchema";
import { ProfessionalModel } from "@/domain/model/professional";

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("schedule");
  
  // Reset state when modal opens or professional changes
  useEffect(() => {
    if (open && professional) {
      setSelectedDate(undefined);
      setAvailableSlots([]);
      setSelectedSlot(null);
      setMessage("");
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

  // Generate slots based on selected date and professional availability
  useEffect(() => {
    if (!selectedDate || !professional) return;

    // Find the day of week name in Portuguese
    const dayOfWeek = format(selectedDate, 'EEEE', { locale: ptBR });
    // Convert to English weekday value (monday, tuesday, etc.)
    const weekdayMap: Record<string, string> = {
      'segunda-feira': 'monday',
      'terça-feira': 'tuesday',
      'quarta-feira': 'wednesday',
      'quinta-feira': 'thursday',
      'sexta-feira': 'friday',
      'sábado': 'saturday',
      'domingo': 'sunday',
    };
    
    const englishDayOfWeek = weekdayMap[dayOfWeek];
    
    // Check if the professional is available on this day
    if (!professional.availableDays.includes(englishDayOfWeek)) {
      setAvailableSlots([]);
      return;
    }

    // Generate time slots
    const slots: string[] = [];
    professional.availableHours.forEach(interval => {
      const startHour = parseInt(interval.startTime.split(":")[0]);
      const startMinute = parseInt(interval.startTime.split(":")[1]);
      const endHour = parseInt(interval.endTime.split(":")[0]);
      const endMinute = parseInt(interval.endTime.split(":")[1]);
      
      let current = new Date();
      current = set(current, { 
        hours: startHour, 
        minutes: startMinute, 
        seconds: 0, 
        milliseconds: 0 
      });
      
      let end = new Date();
      end = set(end, { 
        hours: endHour, 
        minutes: endMinute, 
        seconds: 0, 
        milliseconds: 0 
      });
      
      // Generate slots with proper session duration
      while (isBefore(current, end) || isSameDay(current, end)) {
        const timeStr = format(current, 'HH:mm');
        slots.push(timeStr);
        
        // Add session duration to get next slot
        current.setMinutes(current.getMinutes() + professional.sessionDuration);
        
        // Check if we've gone past the end time
        if (isAfter(current, end)) break;
      }
    });
    
    // Mock some unavailable slots (random)
    const availableSlots = slots.filter((_, index) => index % 3 !== 0);
    setAvailableSlots(availableSlots);
  }, [selectedDate, professional]);

  const handleScheduleAppointment = () => {
    if (!selectedDate || !selectedSlot || !professional) return;
    
    toast.success("Agendamento solicitado!", {
      description: `Consulta com ${professional.name} agendada para ${format(selectedDate, "dd/MM/yyyy")} às ${selectedSlot}.`,
    });
    
    onOpenChange(false);
  };

  const handleSendMessage = () => {
    if (!message || message.trim() === "" || !professional) return;
    
    toast.success("Mensagem enviada!", {
      description: `Sua mensagem foi enviada para ${professional.name}.`,
    });
    
    setMessage("");
    onOpenChange(false);
  };

  if (!professional) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url(${professional.image || '/placeholder.svg'})` }}
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
              <p className="text-sm">{professional.Professional[0].bio}</p>
              
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-therapy-primary" />
                  <span className="text-sm">
                    Atendimento: {professional.Professional[0].tipoAtendimento === "remote" 
                      ? "Online" 
                      : professional.Professional[0].tipoAtendimento === "presential" 
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
                  <span className="text-sm">R${professional.Professional[0].valorAtendimento} por sessão de XX minutos</span>
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
            
            <TabsContent value="schedule" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Selecione uma data:</h4>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    //onSelect={setSelectedDate}
                    locale={ptBR}
                    className={cn("rounded-md border", "pointer-events-auto")}
                    // disabled={(date) => {
                    //   const dayOfWeek = format(date, 'EEEE', { locale: ptBR });
                    //   const weekdayMap: Record<string, string> = {
                    //     'segunda-feira': 'monday',
                    //     'terça-feira': 'tuesday',
                    //     'quarta-feira': 'wednesday',
                    //     'quinta-feira': 'thursday',
                    //     'sexta-feira': 'friday',
                    //     'sábado': 'saturday',
                    //     'domingo': 'sunday',
                    //   };
                    //   const englishDayOfWeek = weekdayMap[dayOfWeek];
                    //   // return (
                    //   //   isBefore(date, addDays(new Date(), -1)) || 
                    //   //   !professional.availableDays.includes(englishDayOfWeek)
                    //   // );
                    // }}
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Horários disponíveis:</h4>
                  {selectedDate ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedSlot === slot ? "default" : "outline"}
                            className={selectedSlot === slot ? "bg-therapy-primary hover:bg-therapy-tertiary" : ""}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {slot}
                          </Button>
                        ))
                      ) : (
                        <p className="text-muted-foreground col-span-3">
                          Não há horários disponíveis para esta data.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Selecione uma data para ver os horários disponíveis.</p>
                  )}
                  
                  {selectedDate && selectedSlot && (
                    <div className="mt-6">
                      <Button 
                        className="w-full bg-therapy-primary hover:bg-therapy-tertiary" 
                        onClick={handleScheduleAppointment}
                      >
                        Agendar consulta
                      </Button>
                      <p className="text-xs text-center mt-2 text-muted-foreground">
                        {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedSlot}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="message" className="pt-4 space-y-4">
              <h4 className="text-sm font-medium">Envie uma mensagem para {professional.name}:</h4>
              <Textarea 
                placeholder="Escreva sua mensagem aqui..." 
                className="min-h-[120px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {message.length}/500 caracteres
                </p>
                <Button 
                  className="bg-therapy-primary hover:bg-therapy-tertiary"
                  onClick={handleSendMessage}
                  disabled={!message || message.trim() === ""}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Enviar mensagem
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
