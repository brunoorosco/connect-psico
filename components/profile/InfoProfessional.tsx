import React from "react"
import { GraduationCap } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ProfileFormValues } from "@/schemas/PsicologoProfileSchema"
import { ProfessionalModel } from "@/domain/model/professional"
import { especialidades } from "@/utils/constants"

type Props = {
  profile: ProfessionalModel
}

export const ProfessionalInfoForm = ({ profile }: Props) => {
  const { control } = useFormContext<ProfileFormValues>()

  return (
    <Card className="therapy-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-therapy-tertiary" />
          <CardTitle>Dados Profissionais</CardTitle>
        </div>
        <CardDescription>Informações sobre sua formação, especialidades e experiência</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Campo CRP (UF + Número) em uma linha */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="ufConselho"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UF</FormLabel>
                  <FormControl>
                    <Input placeholder="SP" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="numConselho"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registro Profissional</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Formação Acadêmica */}
          <FormField
            control={control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formação Acadêmica</FormLabel>
                <FormControl>
                  <Input placeholder="Psicologia - Universidade Federal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Anos de Experiência */}
          <FormField
            control={control}
            name="experiencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anos de experiência</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="70"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="especialidade"
          render={({ field }) => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Especialidades</FormLabel>
                <FormDescription>Selecione todas as suas especialidades e abordagens</FormDescription>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {especialidades.map((specialty) => (
                  <FormItem key={specialty} className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={(field.value ?? []).includes(specialty)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value ?? []), specialty])
                          } else {
                            field.onChange((field.value ?? []).filter((v) => v !== specialty))
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{specialty}</FormLabel>
                  </FormItem>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
