export type Tutorial = {
  id: string
  title: string
  description: string
  content: string
  videoUrl?: string
  category: string
  createdAt: Date
  updatedAt: Date
}

export type TutorialCategory = {
  id: string
  name: string
  description: string
  tutorials: Tutorial[]
}

export type VideoStreamChunk = {
  url: string
  start: number
  end: number
  size: number
}
