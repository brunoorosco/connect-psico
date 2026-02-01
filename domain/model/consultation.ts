import * as z from "zod"

export const consultationSchema = z.object({
  id: z.number(),
  patientId: z.number(),
  notes: z.string(),
  summaryIdMongo: z.string().optional(),
  prescription: z.string().optional(),
  professionalId: z.string(),
  createdAt: z.date(),
})

export type Consultation = z.infer<typeof consultationSchema>
