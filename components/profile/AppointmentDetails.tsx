import React from "react"
import { Calendar, Video, Globe } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { MapPin } from "@/components/ui/map-pin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ProfileFormValues } from "@/schemas/PsicologoProfileSchema"
import { ProfessionalModel } from "@/domain/model/professional"

type Props = {
  profile: ProfessionalModel
}

export const AppointmentDetailsForm = ({ profile }: Props) => {
  const { control, watch, setValue } = useFormContext<ProfileFormValues>()

  return (
    <Card className="therapy-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-therapy-tertiary" />
          <CardTitle>Disponibilidade e Consulta</CardTitle>
        </div>
        <CardDescription>Configure os detalhes sobre suas consultas e disponibilidade</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={control}
            name="tempoConsulta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração aproximada das consultas em minutos</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <Slider
                      min={30}
                      max={120}
                      step={10}
                      value={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>30 min</span>
                      <span className="text-base font-semibold text-black">{field.value} min</span>
                      <span>120 min</span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="valorAtendimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Consulta</FormLabel>
                <FormControl>
                  <Input
                    value={new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format((field.value || 0) / 100)} // <-- divide por 100 para mostrar
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, "") // remove tudo que não for número
                      const numericValue = Number(rawValue) // inteiro em centavos
                      field.onChange(numericValue)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="tipoAtendimento"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de atendimento</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="remoto" id="remoto" />
                    <FormLabel htmlFor="remoto" className="font-normal flex items-center gap-1">
                      <Video className="h-4 w-4" /> Somente Remoto
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="presencial" id="presencial" />
                    <FormLabel htmlFor="presencial" className="font-normal flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> Somente Presencial
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ambos" id="ambos" />
                    <FormLabel htmlFor="ambos" className="font-normal flex items-center gap-1">
                      <Globe className="h-4 w-4" /> Ambos
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
