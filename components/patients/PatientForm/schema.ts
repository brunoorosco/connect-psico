import * as z from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 5 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").optional().or(z.literal("")),
  medicalRecordId: z.string().optional(),
  birthDate: z.string().optional(),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
  cep: z.string().min(8, "CEP inválido").optional(),
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  number: z.string().optional(),
  profissionalId: z.string().cuid("ID do profissional inválido").optional(),
  responsibleName: z.string().optional(),
  responsiblePhone: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;
