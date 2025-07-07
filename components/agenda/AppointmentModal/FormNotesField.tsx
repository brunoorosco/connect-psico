"use client";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { IFormPatientField } from "./types";

export const FormNotesField: React.FC<IFormPatientField> = ({ form }) => (
  <FormField
    control={form.control}
    name="notes"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Observações</FormLabel>
        <FormControl>
          <Textarea {...field} />
        </FormControl>
        <FormDescription>Informações adicionais sobre a consulta.</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
);
