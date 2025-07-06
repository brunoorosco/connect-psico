"use client";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IFormPatientField } from "./types";

export const FormTimeFields: React.FC<IFormPatientField> = ({ form }) => (
  <div className="grid grid-cols-2 gap-4">
    <FormField
      control={form.control}
      name="startTime"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Horário de Início</FormLabel>
          <FormControl>
            <Input type="time" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="endTime"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Horário de Término</FormLabel>
          <FormControl>
            <Input type="time" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);
