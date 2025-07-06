// components/ConsultationDateTimeEditor.tsx
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { IConsultationDateTimeEditor } from "./types";

export const ConsultationDateTimeEditor = ({ date, time, onChangeDate, onChangeTime, onConfirm }: IConsultationDateTimeEditor) => (
  <div className="flex gap-2 items-center">
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="justify-start text-left font-normal">
          <Calendar className="h-4 w-4 mr-1" />
          {format(date, "dd/MM/yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent mode="single" selected={date} onSelect={(d) => onChangeDate(d || new Date())} initialFocus />
      </PopoverContent>
    </Popover>

    <Input type="time" value={time} onChange={(e) => onChangeTime(e.target.value)} className="w-24" />
    <Button variant="outline" size="sm" onClick={onConfirm}>Confirmar</Button>
  </div>
);
