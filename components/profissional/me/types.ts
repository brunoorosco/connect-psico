export type Slot = { time: string; available: boolean }
export type WeekKeys = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
export type WeeklySchedule = Record<WeekKeys, Slot[]>