"use client"
import React, { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { defaultProfileValues, ProfileFormValues, profileSchema } from "@/schemas/PsicologoProfileSchema"
import { PersonalInfoForm } from "@/components/profile/InfoPersonal"
import { ProfessionalInfoForm } from "@/components/profile/InfoProfessional"
import { TargetAudienceForm } from "@/components/profile/TargetAudienceForm"
import { AppointmentDetailsForm } from "@/components/profile/AppointmentDetails"
import { useSession } from "next-auth/react"
import { useGetProfessionalById } from "@/hooks/useProfissionals"
import { updateProfessionalProfile } from "@/actions/users/udpateProfileProfessional"
import { useParams } from "next/navigation"
import { checkUsernameAvailability } from "@/actions/professionals/checkUsername"

const ProfileProfessionalForm: React.FC = () => {
  const [isPending, startTransition] = useTransition()
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultProfileValues,
  })

  const params = useParams()
  const id = params.id as string
  const { data: session, update } = useSession()
  const { user } = useGetProfessionalById(id)

  async function onSubmit(data: ProfileFormValues) {
    startTransition(async () => {
      try {
        if (!session?.user?.id) {
          toast.error("Usuário não autenticado.")
          return
        }

        // 🔹 Validação de username antes de salvar
        if (data.username && data.username !== user?.username) {
          const result = await checkUsernameAvailability(data.username)
          if (!result.available) {
            toast.error("Este nome de perfil já está em uso.")
            return
          }
        }

        const payload = {
          ...data,
          isProfileCompleted: true,
        }

        const result = await updateProfessionalProfile(session.user.id, payload)

        if (result.error) {
          toast.error(result.error)
          return
        }

        if (result.success) {
          toast.success(result.success, {
            description: "Suas informações foram salvas.",
          })

          // 🔹 Atualiza sessão do NextAuth
          await update({
            ...session!.user,
            name: data.name,
            email: data.email,
            phone: data.phone,
            image: data.profilePhoto,
            username: data.username,
            isProfileCompleted: true,
          })
        }
      } catch (error) {
        toast.error("Erro ao atualizar perfil.")
        console.error("❌ Erro no onSubmit:", error)
      }
    })
  }

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.image,
        bio: user.bio,
        numConselho: user.numConselho,
        ufConselho: user.ufConselho,
        education: user.education,
        experiencia: Number(user.experiencia) || 0,
        especialidade: user.especialidade || [],
        valorAtendimento: Number(user.valorAtendimento) || 0,
        tempoConsulta: user.tempoConsulta || 50,
        publicoAlvo: user.publicoAlvo || [],
        tipoAtendimento: user.tipoAtendimento || "ambos",
        username: user.username,
      })
    }
  }, [user, form])

  // Determine if it's onboarding (First access / incomplete profile)
  const isProfileCompleted = user?.isProfileCompleted
  const isOnboarding = user && !isProfileCompleted
  const [step, setStep] = React.useState(1)

  // Wizard Navigation
  const nextStep = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    let fieldsToValidate: any[] = []

    // Define fields to validate per step
    if (step === 1) fieldsToValidate = ["name", "phone", "bio"]
    if (step === 2) fieldsToValidate = ["ufConselho", "numConselho", "education", "experiencia"]
    if (step === 3) fieldsToValidate = ["especialidade", "publicoAlvo"]
    if (step === 4) fieldsToValidate = ["valorAtendimento", "tempoConsulta", "tipoAtendimento"]

    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) setStep(s => s + 1)
  }

  const prevStep = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    setStep(s => s - 1)
  }

  return (
    <div className="lg:container mx-auto py-6 max-w-5xl">
      {isOnboarding && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-therapy-primary mb-2">{`Seja Bem-vindo, ${user?.name}!`}</h1>
          <p className="text-muted-foreground">
            Vamos configurar seu perfil profissional em poucos passos.
          </p>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
            <div
              className="bg-therapy-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <p className="text-right text-sm text-gray-500 mt-1">Passo {step} de 4</p>
        </div>
      )}

      {/* Standard Header for Edit Mode */}
      {!isOnboarding && (
        <p className="text-muted-foreground mb-4">
          Preencha seu perfil profissional para que seus pacientes possam conhecer melhor seu trabalho e especialidades.
        </p>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            // Mapear campos para steps
            const step1Fields = ["name", "phone", "bio", "profilePhoto", "username"]
            const step2Fields = ["education", "experiencia"]
            const step3Fields = ["especialidade", "publicoAlvo"]
            const step4Fields = ["valorAtendimento", "tempoConsulta", "tipoAtendimento"]

            const errorFields = Object.keys(errors)
            let targetStep = step

            // Identificar em qual step está o erro
            if (errorFields.some(field => step1Fields.includes(field))) {
              targetStep = 1
            } else if (errorFields.some(field => step2Fields.includes(field))) {
              targetStep = 2
            } else if (errorFields.some(field => step3Fields.includes(field))) {
              targetStep = 3
            } else if (errorFields.some(field => step4Fields.includes(field))) {
              targetStep = 4
            }

            console.log("🎯 Target step:", targetStep)

            // Voltar para o step com erro
            if (targetStep !== step) {
              setStep(targetStep)
              toast.error(`Por favor, preencha todos os campos obrigatórios no passo ${targetStep}.`)
            } else {
              toast.error("Por favor, preencha todos os campos obrigatórios.")
            }

            // Focar no primeiro campo com erro após um pequeno delay
            setTimeout(() => {
              const firstErrorField = errorFields[0]
              const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement
              if (element) {
                element.focus()
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
              } else {
                console.log("❌ Campo não encontrado no DOM")
              }
            }, 300)
          })}
          className="space-y-8"
        >

          {/* Step 1: Personal Info */}
          {(!isOnboarding || step === 1) && (
            <div className={isOnboarding ? "animate-in slide-in-from-right fade-in duration-300" : ""}>
              <PersonalInfoForm profile={user} />
            </div>
          )}

          {/* Step 2: Professional Info */}
          {(!isOnboarding || step === 2) && (
            <div className={isOnboarding ? "animate-in slide-in-from-right fade-in duration-300" : ""}>
              <ProfessionalInfoForm profile={user} />
            </div>
          )}

          {/* Step 3: Target Audience */}
          {(!isOnboarding || step === 3) && (
            <div className={isOnboarding ? "animate-in slide-in-from-right fade-in duration-300" : ""}>
              <TargetAudienceForm profile={user} />
            </div>
          )}

          {/* Step 4: Appointment Details */}
          {(!isOnboarding || step === 4) && (
            <div className={isOnboarding ? "animate-in slide-in-from-right fade-in duration-300" : ""}>
              <AppointmentDetailsForm profile={user} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            {!isOnboarding ? (
              // Edit Mode Buttons
              <>
                <Button variant="outline" type="button" onClick={() => form.reset()}>
                  Cancelar
                </Button>
                <Button disabled={isPending} className="bg-therapy-primary hover:bg-therapy-tertiary text-gray-50">
                  Salvar perfil
                </Button>
              </>
            ) : (
              // Wizard Mode Buttons
              <>
                {step > 1 && (
                  <Button variant="outline" type="button" onClick={prevStep}>
                    Voltar
                  </Button>
                )}

                {step < 4 ? (
                  <Button type="button" onClick={nextStep} className="bg-therapy-primary text-white">
                    Próximo
                  </Button>
                ) : (
                  <Button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
                    Finalizar Cadastro
                  </Button>
                )}
              </>
            )}
          </div>
        </form>
      </Form>
    </div>
  )

}

export default ProfileProfessionalForm
