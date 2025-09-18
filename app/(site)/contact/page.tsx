"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Mail, Cookie, FileText, Shield } from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  subject: z.string().min(3, { message: "Assunto deve ter pelo menos 3 caracteres" }),
  message: z.string().min(10, { message: "Mensagem deve ter pelo menos 10 caracteres" }),
})

type FormValues = z.infer<typeof formSchema>

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.")
      form.reset()
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Erro ao enviar mensagem. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Entre em Contato</h1>
          <p className="text-lg text-gray-600 mb-8 text-center">
            Tem alguma dúvida ou sugestão? Preencha o formulário abaixo e entraremos em contato o mais breve possível.
          </p>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu.email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assunto</FormLabel>
                      <FormControl>
                        <Input placeholder="Assunto da mensagem" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Digite sua mensagem aqui..." className="min-h-[150px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Mail className="mx-auto h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-gray-600">contato@psicomais.com</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Shield className="mx-auto h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Horário de Atendimento</h3>
              <p className="text-gray-600">Segunda a Sexta, 9h às 18h</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center justify-between">
              <FileText className="mx-auto h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Suporte</h3>
              <a
                href={`https://wa.me/5511954567182?text=Olá, preciso de suporte na plataforma.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white font-medium px-4 py-2 rounded-lg shadow hover:bg-green-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
                  <path d="M20.52 3.48A11.82 11.82 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.1.55 4.12 1.59 5.91L0 24l6.22-1.63A11.9 11.9 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 21.75c-1.95 0-3.83-.52-5.48-1.51l-.39-.23-3.69.97.99-3.61-.25-.37A9.71 9.71 0 0 1 2.25 12c0-5.39 4.36-9.75 9.75-9.75 2.61 0 5.07 1.02 6.91 2.86a9.67 9.67 0 0 1 2.84 6.89c0 5.39-4.36 9.75-9.75 9.75zm5.28-7.34c-.29-.14-1.71-.84-1.97-.94-.27-.1-.47-.14-.67.14-.19.29-.77.94-.94 1.13-.17.19-.34.21-.63.07-.29-.14-1.22-.45-2.33-1.43-.86-.76-1.44-1.7-1.61-1.99-.17-.29-.02-.45.12-.59.12-.12.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.19 0-.5.07-.77.36-.27.29-1.01.98-1.01 2.39s1.04 2.77 1.19 2.96c.14.19 2.04 3.11 4.94 4.36.69.3 1.22.48 1.64.62.69.22 1.31.19 1.8.12.55-.08 1.71-.7 1.95-1.38.24-.67.24-1.24.17-1.38-.07-.14-.26-.21-.55-.36z" />
                </svg>
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Contact
