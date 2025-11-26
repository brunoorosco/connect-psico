"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useCurrentUser } from "@hooks/use-current-user"
import { anamnesisCreate } from "@/actions/anamenesis/createAnamenesis"

const AnamnesisAdultForm = () => {
  const user = useCurrentUser()
  const [formData, setFormData] = useState({
    userId: user?.id as string,
    fullName: user?.name ?? "",
    birthDate: "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    maritalStatus: "",
    occupation: "",
    education: "",
    referredBy: "",
    currentComplaint: "",
    complaintHistory: "",
    previousTreatment: "",
    medications: "",
    familyHistory: "",
    personalHistory: "",
    sleepPattern: "",
    appetite: "",
    mood: "",
    anxiety: "",
    stressLevel: "",
    suicidalThoughts: false,
    selfHarm: false,
    violence: false,
    additionalInfo: "",
    consent: false,
  })

  const [step, setStep] = useState(1)
  const totalSteps = 4

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    if (!formData.consent) {
      toast.error("Você precisa aceitar os termos de consentimento para enviar o formulário.")
      return
    }

    try {
      const resp = await anamnesisCreate(formData)
      console.log("resp :>> ", resp)
      console.log("Form data submitted:", formData)
      toast.success("Anamnese enviada com sucesso!")
    } catch (err) {
      console.error(err)
    }
    // In a real app, you would send this data to your backend
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="address">Endereço Completo</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Rua, número, bairro, cidade, estado"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Nome"
                />
              </div>

              <div>
                <Label htmlFor="emergencyPhone">Telefone de Emergência</Label>
                <Input
                  id="emergencyPhone"
                  name="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Estado Civil</Label>
              <RadioGroup
                value={formData.maritalStatus}
                onValueChange={(value) => handleSelectChange("maritalStatus", value)}
                className="flex flex-col space-y-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single">Solteiro(a)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="married" id="married" />
                  <Label htmlFor="married">Casado(a)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="divorced" id="divorced" />
                  <Label htmlFor="divorced">Divorciado(a)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="widowed" id="widowed" />
                  <Label htmlFor="widowed">Viúvo(a)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="separated" id="separated" />
                  <Label htmlFor="separated">Separado(a)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="occupation">Profissão/Ocupação</Label>
                <Input id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} />
              </div>

              <div>
                <Label htmlFor="education">Escolaridade</Label>
                <Select value={formData.education} onValueChange={(value) => handleSelectChange("education", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elementary">Ensino Fundamental</SelectItem>
                    <SelectItem value="highschool">Ensino Médio</SelectItem>
                    <SelectItem value="technical">Ensino Técnico</SelectItem>
                    <SelectItem value="bachelor">Ensino Superior</SelectItem>
                    <SelectItem value="postgraduate">Pós-graduação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="referredBy">Como soube do serviço?</Label>
              <Input id="referredBy" name="referredBy" value={formData.referredBy} onChange={handleChange} />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentComplaint">Queixa Principal *</Label>
              <Textarea
                id="currentComplaint"
                name="currentComplaint"
                value={formData.currentComplaint}
                onChange={handleChange}
                required
                placeholder="Descreva o motivo principal que levou você a buscar atendimento psicológico"
              />
            </div>

            <div>
              <Label htmlFor="complaintHistory">Histórico da Queixa</Label>
              <Textarea
                id="complaintHistory"
                name="complaintHistory"
                value={formData.complaintHistory}
                onChange={handleChange}
                placeholder="Como começou? Com que frequência ocorre? O que costuma piorar ou melhorar?"
              />
            </div>

            <div>
              <Label htmlFor="previousTreatment">Tratamentos Anteriores</Label>
              <Textarea
                id="previousTreatment"
                name="previousTreatment"
                value={formData.previousTreatment}
                onChange={handleChange}
                placeholder="Já fez terapia antes? Com que profissional? Por quanto tempo?"
              />
            </div>

            <div>
              <Label htmlFor="medications">Medicações em Uso</Label>
              <Textarea
                id="medications"
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                placeholder="Está fazendo uso de algum medicamento? Qual(is)?"
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="familyHistory">Histórico Familiar</Label>
              <Textarea
                id="familyHistory"
                name="familyHistory"
                value={formData.familyHistory}
                onChange={handleChange}
                placeholder="Histórico de doenças físicas ou mentais na família"
              />
            </div>

            <div>
              <Label htmlFor="personalHistory">Histórico Pessoal</Label>
              <Textarea
                id="personalHistory"
                name="personalHistory"
                value={formData.personalHistory}
                onChange={handleChange}
                placeholder="Doenças físicas, cirurgias, acidentes, traumas"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sleepPattern">Sono</Label>
                <Select
                  value={formData.sleepPattern}
                  onValueChange={(value) => handleSelectChange("sleepPattern", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Bom</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="poor">Ruim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="appetite">Apetite</Label>
                <Select value={formData.appetite} onValueChange={(value) => handleSelectChange("appetite", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Bom</SelectItem>
                    <SelectItem value="increased">Aumentado</SelectItem>
                    <SelectItem value="decreased">Diminuído</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mood">Humor</Label>
                <Select value={formData.mood} onValueChange={(value) => handleSelectChange("mood", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Bom</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="bad">Ruim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="anxiety">Ansiedade</Label>
                <Select value={formData.anxiety} onValueChange={(value) => handleSelectChange("anxiety", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    <SelectItem value="mild">Leve</SelectItem>
                    <SelectItem value="moderate">Moderada</SelectItem>
                    <SelectItem value="severe">Intensa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stressLevel">Nível de Estresse</Label>
                <Select
                  value={formData.stressLevel}
                  onValueChange={(value) => handleSelectChange("stressLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixo</SelectItem>
                    <SelectItem value="moderate">Moderado</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="very-high">Muito Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="suicidalThoughts"
                  name="suicidalThoughts"
                  checked={formData.suicidalThoughts}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, suicidalThoughts: !!checked }))}
                />
                <Label htmlFor="suicidalThoughts">Pensamentos suicidas</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selfHarm"
                  name="selfHarm"
                  checked={formData.selfHarm}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, selfHarm: !!checked }))}
                />
                <Label htmlFor="selfHarm">Automutilação</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="violence"
                  name="violence"
                  checked={formData.violence}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, violence: !!checked }))}
                />
                <Label htmlFor="violence">Histórico de violência (sofrida ou exercida)</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="additionalInfo">Informações Adicionais</Label>
              <Textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                placeholder="Qualquer outra informação que considere relevante"
              />
            </div>

            <div className="flex items-start space-x-2 pt-4">
              <Checkbox
                id="consent"
                name="consent"
                checked={formData.consent}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, consent: !!checked }))}
                required
              />
              <Label htmlFor="consent">
                Declaro que li e concordo com o uso das informações fornecidas para fins terapêuticos e que entendo que
                os dados serão tratados com sigilo e confidencialidade conforme a legislação vigente. *
              </Label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Anamnese Psicológica</CardTitle>
            <CardDescription>
              Por favor, preencha todas as informações solicitadas. Estas informações são fundamentais para o início do
              seu processo terapêutico.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>
                  Passo {step} de {totalSteps}
                </span>
                <span>{Math.round((step / totalSteps) * 100)}% completo</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleNext()
              }}
            >
              {renderStepContent()}
            </form>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              Voltar
            </Button>

            <Button onClick={handleNext} type="button" disabled={step === totalSteps && !formData.consent}>
              {step === totalSteps ? "Enviar Anamnese" : "Próximo"}
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Este formulário é protegido e suas informações são confidenciais.</p>
          <p className="mt-2">Se tiver dúvidas, entre em contato com seu psicólogo.</p>
        </div>
      </div>
    </div>
  )
}

export default AnamnesisAdultForm
