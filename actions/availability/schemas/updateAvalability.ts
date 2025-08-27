import { z } from "zod"

// HH:mm
const HHMM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário deve estar no formato "HH:mm"')
const TimeSlotSchema = z
  .object({
    id: z.string(), // id gerado no client; não precisamos dele no banco
    startTime: HHMM,
    endTime: HHMM,
  })
  .refine(
    ({ startTime, endTime }) => {
      const toMin = (t: string) => {
        const [h, m] = t.split(":").map(Number)
        return h * 60 + m
      }
      return toMin(startTime) < toMin(endTime)
    },
    { message: "A hora inicial deve ser menor que a final", path: ["endTime"] }
  )

export const UpdateAvailabilityByDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato "yyyy-MM-dd"'),
  timeSlots: z.array(TimeSlotSchema).superRefine((slots, ctx) => {
    // checar sobreposição entre slots
    const toMin = (t: string) => {
      const [h, m] = t.split(":").map(Number)
      return h * 60 + m
    }
    const sorted = [...slots].sort((a, b) => toMin(a.startTime) - toMin(b.startTime))
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const cur = sorted[i]
      if (toMin(cur.startTime) < toMin(prev.endTime)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Conflito entre ${prev.startTime}-${prev.endTime} e ${cur.startTime}-${cur.endTime}`,
          path: ["timeSlots", i, "startTime"],
        })
        break
      }
    }
  }),
})
