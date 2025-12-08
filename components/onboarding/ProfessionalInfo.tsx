import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { ufCRP } from "@/utils/ufCRP"

interface ProfessionalInfoProps {
  onNext: (data: { numberConselho: string | null; ufConselho: string| null }) => void
  isLoading: boolean
}

const ProfessionalInfo: React.FC<ProfessionalInfoProps> = ({ onNext, isLoading }) => {
  const [numberConselho, setNumberConselho] = useState("")
  const [ufConselho, setUfConselho] = useState("")
  const [noRegistration, setNoRegistration] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onNext({
      numberConselho: noRegistration ? null : numberConselho,
      ufConselho: noRegistration ? null : ufConselho,
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-2">Informações Profissionais</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="no-reg"
            checked={noRegistration}
            onChange={(e) => setNoRegistration(e.target.checked)}
          />
          <Label htmlFor="no-reg">Ainda não possuo registro profissional</Label>
        </div>

        {/* Número do conselho */}
        <div>
          <Label htmlFor="registration">Registro Profissional</Label>
          <Input
            id="registration"
            type="text"
            maxLength={6}
            placeholder="123456"
            value={numberConselho}
            onChange={(e) => setNumberConselho(e.target.value)}
            disabled={noRegistration}
            required={!noRegistration}
          />
        </div>

        {/* Estado */}
        <div>
          <Label htmlFor="state">Estado</Label>
          <Select value={ufConselho} onValueChange={setUfConselho} disabled={noRegistration} required={!noRegistration}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione seu estado" />
            </SelectTrigger>
            <SelectContent>
              {ufCRP.map((stateCode) => (
                <SelectItem key={stateCode} value={stateCode}>
                  CRP - {stateCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Finalizando...
            </>
          ) : (
            "Finalizar Cadastro"
          )}
        </Button>
      </form>
    </div>
  )
}

export default ProfessionalInfo
