import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { especialidades } from "@/utils/constants"

interface TherapistFilterProps {
  selectedSpecialty: string
  onSpecialtyChange: (value: string) => void
}

export const TherapistFilter = ({ selectedSpecialty, onSpecialtyChange }: TherapistFilterProps) => {
  return (
    <div className="flex items-center gap-4">
      <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Filtrar por especialidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key={"none"} value="none">
            Todas as especialidades
          </SelectItem>
          {especialidades.map((specialty) => (
            <SelectItem key={specialty} value={specialty}>
              {specialty}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
