"use client"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const addressSchema = z.object({
  cidade: z.string().optional(),
  bairro: z.string().optional(),
  estado: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  cep: z.string().optional(),
})

type AddressFormData = z.infer<typeof addressSchema>

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void
  initialData?: Partial<AddressFormData>
  isLoading?: boolean
}

export default function AddressForm({ onSubmit, initialData, isLoading = false }: AddressFormProps) {
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      cidade: initialData?.cidade || "",
      bairro: initialData?.bairro || "",
      estado: initialData?.estado || "",
      logradouro: initialData?.logradouro || "",
      numero: initialData?.numero || "",
      complemento: initialData?.complemento || "",
      cep: initialData?.cep || "",
    },
  })

  // Aplica máscara de CEP (00000-000)
  const handleCepChange = (value: string) => {
    const numeric = value.replace(/\D/g, "")
    if (numeric.length <= 8) {
      const masked = numeric.replace(/^(\d{5})(\d{0,3})$/, "$1-$2")
      form.setValue("cep", masked)
    }
  }

  // Busca endereço via ViaCEP
  const fetchAddress = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "")
    if (cleanCep.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        form.setValue("logradouro", data.logradouro || "")
        form.setValue("bairro", data.bairro || "")
        form.setValue("cidade", data.localidade || "")
        form.setValue("estado", data.uf || "")
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
    }
  }

  const handleSubmit = (data: AddressFormData) => {
    const cleanData = {
      ...data,
      cep: data.cep?.replace(/\D/g, ""), // remove máscara antes do envio
    }
    onSubmit(cleanData)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Endereço do Local de Atendimento</CardTitle>
        <CardDescription>Preencha as informações do endereço onde os atendimentos serão realizados</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00000-000"
                          value={field.value}
                          maxLength={9}
                          onChange={(e) => handleCepChange(e.target.value)}
                          onBlur={() => fetchAddress(field.value || "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-3 sm:col-span-3">
                <FormField
                  control={form.control}
                  name="logradouro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Avenida, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Apartamento, sala, bloco, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-1">
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="SP, RJ, MG..." {...field} maxLength={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Endereço"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
