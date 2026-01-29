"use client"

import React, { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import useSWR from "swr"
import InputMask from "react-input-mask";
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { defaultProfileValues } from "@/schemas/PsicologoProfileSchema"
import { getUserById, updateUserProfile } from "@/actions/users"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@components/ui"
import { UploadCloud, User } from "lucide-react"
import { uploadImageToCloudinary } from "@/services/cloudinaryService/uploadImage"
import { TUser, userSchemaProfile } from "@/domain/model/user"
import { useSession } from "next-auth/react"
import { ProfileSkeleton } from "./ProfileUserSkeleton"

const UserProfileForm: React.FC = () => {
  const { id } = useParams() as { id: string }
  const { data: session, update } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session && id !== String(session.user.id)) {
      toast.error("Você não tem permissão para acessar essa página.")
      router.push("/")
    }
  }, [session, id, router])

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const form = useForm<TUser>({
    resolver: zodResolver(userSchemaProfile),
    defaultValues: defaultProfileValues,
  })
  const { control } = form

  const {
    data: user,
    error,
    isLoading,
  } = useSWR(id ? `/user/${id}` : null, () => getUserById(id), {
    revalidateOnFocus: false,
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        email: user.email ?? "",
        telefone: user.phone ?? "",
        image: user.image ?? "",
      })
    }
  }, [user, form])

  const onSubmit = async (data: TUser) => {
    try {
      const result = await updateUserProfile(id, data)

      if (result.success) {
        toast.success(result.success, {
          description: "Suas informações foram salvas.",
        })

        // 🔹 Atualiza sessão do NextAuth imediatamente
        if (session?.user) {
          await update({
            ...session.user,
            name: data.name,
            email: data.email,
            phone: data.telefone,
            image: data.image,
          })
        }
      } else if (result.error) {
        toast.error(result.error)
      }
    } catch (error) {
      console.error("Erro ao enviar os dados:", error)
      toast.error("Erro ao atualizar o perfil. Por favor, tente novamente.")
    }
  }

  if (isLoading || status === "loading") {
    return <ProfileSkeleton />
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-therapy-tertiary">Perfil</h1>
      <p className="text-muted-foreground mb-8">Preencha seu perfil.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                          <Input placeholder="João Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <div className="w-3/4">
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

                    <FormField
                      control={form.control}
                      name="telefone"
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
                </div>

                <div className="flex flex-col items-center">
                  <FormField
                    control={control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto de perfil</FormLabel>
                        <FormControl>
                          <div>
                            <label
                              onClick={() => fileInputRef.current?.click()}
                              className="w-32 h-32 rounded-full border flex items-center justify-center cursor-pointer hover:opacity-80 transition"
                            >
                              {field.value ? (
                                <img src={field.value} alt="Preview" className="w-32 h-32 object-cover rounded-full" />
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
                                if (file && user?.id) {
                                  const url = await uploadImageToCloudinary(file, user.id)
                                  field.onChange(url)
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
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => form.reset()}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-therapy-tertiary text-gray-50" >
              Salvar perfil
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default UserProfileForm
