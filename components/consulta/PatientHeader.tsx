// components/PatientHeader.tsx
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IPatientHeader } from "./types";

export const PatientHeader = ({ name, date, time, isEditing, onEditToggle }: IPatientHeader) => (
  <div className="flex flex-col sm:flex-row justify-between">
    <div>
      <h2 className="font-bold text-xl text-therapy-tertiary">{name}</h2>
      {/* <div className="text-sm text-gray-500">
        {age} anos • {gender}
        {diagnosis && <>• <span className="font-medium">{diagnosis}</span></>}
      </div> */}
    </div>
    {!isEditing && (
      <div className="mt-3 sm:mt-0 flex items-center text-sm text-gray-600">
        <Calendar className="h-4 w-4 mr-1 text-primary" />
        <span>{format(date, "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
        <span className="mx-2">•</span>
        <Clock className="h-4 w-4 mr-1 text-primary" />
        <span>{time}</span>
        <Button onClick={onEditToggle} variant="ghost" size="sm" className="ml-2 h-7 text-therapy-tertiary hover:text-primary">
          Editar
        </Button>
      </div>
    )}
  </div>
);