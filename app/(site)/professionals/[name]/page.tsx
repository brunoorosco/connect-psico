"use client"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Clock, GraduationCap, Award, Star, Mail, Phone, MessageCircle } from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import { useParams } from "next/navigation"

// Mock professional data
const mockProfessional = {
  id: 1,
  name: "Dra. Ana Carolina Silva",
  specialty: "Psicologia Clínica",
  approach: "Terapia Cognitivo-Comportamental",
  avatar: "/placeholder.svg",
  location: "São Paulo, SP",
  experience: "8 anos de experiência",
  rating: 4.9,
  reviews: 127,
  education: [
    "Mestrado em Psicologia Clínica - USP",
    "Especialização em TCC - PUC-SP",
    "Graduação em Psicologia - UNIFESP",
  ],
  certifications: ["CRP 06/123456", "Certificação em EMDR", "Formação em Terapia de Casal"],
  bio: "Psicóloga clínica com mais de 8 anos de experiência no atendimento de adultos e adolescentes. Especialista em Terapia Cognitivo-Comportamental com foco em transtornos de ansiedade, depressão e relacionamentos interpessoais. Abordagem humanizada e baseada em evidências científicas.",
  email: "ana.silva@email.com",
  phone: "(11) 99999-9999",
  weeklySchedule: {
    monday: [
      { time: "08:00", available: true },
      { time: "09:00", available: true },
      { time: "10:00", available: false },
      { time: "11:00", available: true },
      { time: "14:00", available: true },
      { time: "15:00", available: false },
      { time: "16:00", available: true },
      { time: "17:00", available: true },
    ],
    tuesday: [
      { time: "08:00", available: false },
      { time: "09:00", available: true },
      { time: "10:00", available: true },
      { time: "11:00", available: true },
      { time: "14:00", available: false },
      { time: "15:00", available: true },
      { time: "16:00", available: true },
      { time: "17:00", available: false },
    ],
    wednesday: [
      { time: "08:00", available: true },
      { time: "09:00", available: true },
      { time: "10:00", available: true },
      { time: "11:00", available: false },
      { time: "14:00", available: true },
      { time: "15:00", available: true },
      { time: "16:00", available: false },
      { time: "17:00", available: true },
    ],
    thursday: [
      { time: "08:00", available: false },
      { time: "09:00", available: false },
      { time: "10:00", available: true },
      { time: "11:00", available: true },
      { time: "14:00", available: true },
      { time: "15:00", available: true },
      { time: "16:00", available: true },
      { time: "17:00", available: true },
    ],
    friday: [
      { time: "08:00", available: true },
      { time: "09:00", available: true },
      { time: "10:00", available: false },
      { time: "11:00", available: false },
      { time: "14:00", available: true },
      { time: "15:00", available: true },
      { time: "16:00", available: true },
      { time: "17:00", available: false },
    ],
  },
}

const daysOfWeek = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Sexta-feira" },
]

const ProfessionalProfile = () => {
  const { name } = useParams()
  const professional = mockProfessional

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Professional Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={professional.avatar} alt={professional.name} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {professional.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">{professional.name}</h1>
                    <p className="text-muted-foreground mb-2">{professional.specialty}</p>
                    <Badge variant="secondary" className="mb-4">
                      {professional.approach}
                    </Badge>

                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{professional.rating}</span>
                      <span className="text-muted-foreground">({professional.reviews} avaliações)</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{professional.location}</span>
                    </div>

                    <p className="text-sm text-muted-foreground">{professional.experience}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{professional.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{professional.phone}</span>
                </div>
                <Button className="w-full mt-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Consulta
                </Button>
              </CardContent>
            </Card>

            {/* Education Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Formação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {professional.education.map((edu, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {edu}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Certifications Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {professional.certifications.map((cert, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {cert}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bio and Schedule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Card */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Profissional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{professional.bio}</p>
              </CardContent>
            </Card>

            {/* Weekly Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Disponibilidade Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {daysOfWeek.map((day) => (
                    <div key={day.key} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3 text-foreground">{day.label}</h3>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {professional.weeklySchedule[day.key as keyof typeof professional.weeklySchedule]?.map(
                          (slot, index) => (
                            <Button
                              key={index}
                              variant={slot.available ? "outline" : "default"}
                              size="sm"
                              className={`text-xs ${
                                slot.available
                                  ? "border-primary text-therapy-primary hover:bg-accent hover:text-therapy-secondary"
                                  : "opacity-50 cursor-not-allowed"
                              }`}
                              disabled={!slot.available}
                            >
                              {slot.time}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-primary rounded"></div>
                      <span>Disponível</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-muted-foreground rounded"></div>
                      <span>Ocupado</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Clique em um horário disponível para agendar sua consulta
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfessionalProfile
