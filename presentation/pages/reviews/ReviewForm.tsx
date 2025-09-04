import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { CardHeader, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@hooks/useToast"
import RatingStars from "./RatingStars"
import { ReviewFormData, reviewSchema } from "./types"

interface Therapist {
  id: string
  name: string
}

interface Props {
  therapists: Therapist[]
  onSuccess: () => void
  onCancel: () => void
}

const ReviewForm = ({ therapists, onSuccess, onCancel }: Props) => {
  const { toast } = useToast()

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { therapist_id: "", rating: 0, comment: "" },
  })

  const onSubmit = async (data: ReviewFormData) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase.from("reviews").insert({
        patient_id: session.user.id,
        therapist_id: data.therapist_id,
        rating: data.rating,
        comment: data.comment,
      })

      if (error) throw error

      toast({ title: "Sucesso", description: "Avaliação enviada com sucesso!" })
      form.reset()
      onSuccess()
    } catch (error) {
      console.error(error)
      toast({ title: "Erro", description: "Não foi possível enviar a avaliação.", variant: "destructive" })
    }
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
              name="therapist_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terapeuta</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o terapeuta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {therapists.map((t) => (
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
                    <Textarea placeholder="Compartilhe sua experiência..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit">Enviar Avaliação</Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </>
  )
}

export default ReviewForm
