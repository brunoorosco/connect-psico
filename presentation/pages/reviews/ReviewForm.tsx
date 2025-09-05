"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { CardHeader, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import RatingStars from "./RatingStars"
import { ReviewFormData, reviewSchema } from "./types"
import { createReviewAction } from "@/actions/review/create"
import { toast } from "sonner"

type Profissional = { id: string; name: string }

interface Props {
  profissional: Profissional[]
  onSuccess: () => void
  onCancel: () => void
}

export default function ReviewForm({ profissional, onSuccess, onCancel }: Props) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { profissionalId: "", rating: 0, comment: "" },
  })

  const onSubmit = (values: ReviewFormData) => {
    startTransition(async () => {
      try {
        const resp = await createReviewAction({
          profissionalId: values.profissionalId,
          rating: values.rating,
          comment: values.comment,
        })
        if (!resp.id) {
          toast.error("Erro", {
            description: "Não foi possível enviar a avaliação.",
          })
        }
        toast.success("Sucesso", { description: "Avaliação enviada com sucesso!" })
        form.reset()
        onSuccess()
      } catch (err: any) {
        toast.error("Erro", {
          description: err?.message ?? "Não foi possível enviar a avaliação.",
        })
      }
    })
  }

  return (
    <>
      <CardHeader>
        <h2 className="text-xl font-semibold">Criar Nova Avaliação</h2>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="profissionalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terapeuta</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o terapeuta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {profissional.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avaliação</FormLabel>
                  <FormControl>
                    <RatingStars rating={field.value} interactive onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentário</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[100px]"
                      placeholder="Compartilhe sua experiência..."
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Enviando..." : "Enviar Avaliação"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </>
  )
}
