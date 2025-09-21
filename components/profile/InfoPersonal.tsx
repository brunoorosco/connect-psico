"use client"
import React, { useRef, useState } from "react"
import { Info, UploadCloud, User } from "lucide-react"
import { useFormContext, useWatch } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ProfileFormValues } from "@/schemas/PsicologoProfileSchema"
import { ProfessionalModel } from "@/domain/model/professional"
import { uploadImageToCloudinary } from "@/services/cloudinaryService/uploadImage"
import InputMask from "react-input-mask"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip"
import { checkUsernameAvailability } from "@/actions/professionals/checkUsername"
import { useSession } from "next-auth/react"

type Props = {
  profile: ProfessionalModel
}

export const PersonalInfoForm = ({ profile }: Props) => {
  const { control } = useFormContext<ProfileFormValues>()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <Card className="therapy-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-therapy-tertiary" />
          <CardTitle>Dados Pessoais</CardTitle>
        </div>
        <CardDescription>Informações básicas sobre você que serão exibidas no seu perfil</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4 items-start">
              <div className="w-2/4">
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu.email@exemplo.com" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-1/4">
                <FormField
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone/WhatsApp</FormLabel>
                      <FormControl>
                        <InputMask
                          mask="(99) 99999-9999"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              type="tel"
                              placeholder="(00) 00000-0000"
                              required
                              name={field.name}
                              ref={field.ref}
                            />
                          )}
                        </InputMask>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-1/4">
                <FormField
                  control={control}
                  name="username"
                  render={({ field }) => {
                    const username = useWatch({ control, name: "username" })
                    const [availability, setAvailability] = useState<string | null>(null)
                    const { data: session } = useSession() // 🔹 pega usuário logado

                    const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
                      field.onBlur()
                      if (e.target.value) {
                        const result = await checkUsernameAvailability(e.target.value)

                        // 🔹 só mostra erro se o dono do username não for o próprio user
                        if (!result.available && result.ownerId !== session?.user?.id) {
                          setAvailability(result.message)
                        } else if (result.available) {
                          setAvailability(result.message)
                        } else {
                          setAvailability(null) // se for o próprio user, não mostra nada
                        }
                      }
                    }

                    return (
                      <FormItem>
                        <div className="flex mt-[7.8px] gap-2">
                          <FormLabel>Perfil Público</FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {username
                                    ? `Seu link público será: https://psicomais.com/terapeutas/${username}`
                                    : "Digite seu usuário para ver o link público"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* 🔹 container do input e mensagem */}
                        <div className="relative min-h-[3rem]">
                          <FormControl>
                            <Input
                              placeholder="ex: joao.silva"
                              {...field}
                              onBlur={handleBlur}
                              className={`${
                                availability && !availability.includes("disponível") ? "focus:ring-red-500 border-red-500 border-2 focus-visible:outline-none focus-visible:ring-0" : ""
                              }`}
                            />
                          </FormControl>

                          {availability && (
                            <p
                              className={`absolute -bottom-3 left-0 text-sm ${
                                availability.includes("disponível") ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {availability}
                            </p>
                          )}
                        </div>

                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center ">
            <FormField
              control={control}
              name="profilePhoto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="">Foto de perfil</FormLabel>
                  <FormControl>
                    <div>
                      <label
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 rounded-full border flex items-center justify-center cursor-pointer hover:opacity-80 transition"
                      >
                        {typeof field.value === "string" && field.value ? (
                          <img
                            src={field.value}
                            alt="Preview da imagem"
                            className="w-32 h-32 object-cover rounded-full"
                          />
                        ) : (
                          <UploadCloud className="w-10 h-10 text-gray-400" />
                        )}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const url = await uploadImageToCloudinary(file, profile.id)
                            field.onChange(url) // ✅ Agora sim, salva no form uma URL pública
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografia</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Fale um pouco sobre você, sua abordagem e experiência..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormDescription>Esta descrição será exibida publicamente em seu perfil</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
