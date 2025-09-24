// components/forms/AdultAnamnesisForm.tsx
"use client"

import { UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CheckboxGroup } from "./CheckboxGroup"
import { AdultAnamnesisData } from "./schema"

type Props = {
  form: UseFormReturn<AdultAnamnesisData>
  onSubmit: (data: AdultAnamnesisData) => Promise<void> | void
}

const physicalOptions = [
  { key: "headache", label: "Dor de cabeça" },
  { key: "dizziness", label: "Atordoação" },
  { key: "nauseaVomiting", label: "Náusea/Vômito" },
  { key: "fatigue", label: "Fadiga excessiva" },
  // ...adicione conforme a lista da ficha
]

export function AdultAnamnesisForm({ form, onSubmit }: Props) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Cabeçalho básico */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nascimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phones"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* SINTOMAS Físicos */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Sintomas Físicos</h2>
          <FormField
            control={form.control}
            name="symptomsPhysical"
            render={() => (
              <FormItem>
                <CheckboxGroup name="symptomsPhysical" control={form.control} options={physicalOptions} columns={2} />
              </FormItem>
            )}
          />
          {/* campos “indicar local” */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="symptomsPhysical.lossSensation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perda de sensibilidade (local)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="symptomsPhysical.skinParesthesia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sensações estranhas na pele (local)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Outros blocos: cognition/memory/humor... */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Demanda / Observações</h2>
          <FormField
            control={form.control}
            name="demand"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea className="min-h-[120px]" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </section>

        <div className="flex justify-end">
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  )
}
