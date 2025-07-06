"use client";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { mockPatients } from "../mockData";
import { useState } from "react";
import { IFormPatientField } from "./types";

export const FormPatientField: React.FC<IFormPatientField> = ({ form }) => {
  const [open, setOpen] = useState(false);
  const patients = mockPatients;

  return (
    <FormField
      control={form.control}
      name="patientId"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Paciente</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                >
                  {field.value
                    ? patients.find((p) => p.userId === field.value)?.name
                    : "Selecione um paciente"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Buscar paciente..." />
                <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                <CommandGroup>
                  {patients.map((patient) => (
                    <CommandItem
                      key={patient.userId}
                      value={patient.userId}
                      onSelect={() => {
                        form.setValue("patientId", patient.userId);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", patient.userId === field.value ? "opacity-100" : "opacity-0")}
                      />
                      <div className="flex flex-col">
                        <span>{patient.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {patient.medicalRecordId
                            ? `Prontuário: ${patient.medicalRecordId}`
                            : "Sem prontuário vinculado"}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
