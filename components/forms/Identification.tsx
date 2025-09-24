// components/forms/IdentificationForm.tsx
"use client"

import { UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import InputMask from "react-input-mask"
import React from "react"
import { IdentificationData } from "./schema"

type Props = {
  form: UseFormReturn<IdentificationData>
  onSubmit: (data: IdentificationData) => Promise<void> | void
  onCancel?: () => void
  isEdit?: boolean
}

export function IdentificationForm({ form, onSubmit, onCancel, isEdit }: Props) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Linha 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input className="uppercase" placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-1">
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-1">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <InputMask mask="(99) 99999-9999" {...field} onChange={field.onChange}>
                      {(inputProps: any) => <Input placeholder="(11) 99999-9999" {...inputProps} />}
                    </InputMask>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Linha 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, nº, complemento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input placeholder="Bairro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Linha 3 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="profession"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Profissão</FormLabel>
                <FormControl>
                  <Input placeholder="Profissão" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="schooling"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Escolaridade</FormLabel>
                <FormControl>
                  <Input placeholder="Ex.: Superior completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isStudying"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estudando?</FormLabel>
                <FormControl>
                  <select
                    className="w-full border rounded-md h-10 px-3"
                    value={field.value ? "sim" : "nao"}
                    onChange={(e) => field.onChange(e.target.value === "sim")}
                  >
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Observações */}
        <FormField
          control={form.control}
          name="complaint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Queixa</FormLabel>
              <FormControl>
                <Textarea className="min-h-[120px]" placeholder="Descreva a queixa principal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit">{isEdit ? "Atualizar" : "Salvar"}</Button>
        </div>
      </form>
    </Form>
  )
}
