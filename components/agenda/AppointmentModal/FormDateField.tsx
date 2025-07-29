"use client";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IFormPatientField } from "./types";

export const FormDateField: React.FC<IFormPatientField> = ({ form }) => (
  <FormField
    control={form.control}
    name="appointmentDate"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Data</FormLabel>
        <FormControl>
          <Input type="date" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
