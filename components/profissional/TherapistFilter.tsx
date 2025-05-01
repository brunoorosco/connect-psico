
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TherapistFilterProps {
  selectedSpecialty: string;
  onSpecialtyChange: (value: string) => void;
}

export const TherapistFilter = ({
  selectedSpecialty,
  onSpecialtyChange,
}: TherapistFilterProps) => {
  const specialties = [
    "Terapia Cognitivo-Comportamental",
    "Psicanálise",
    "Terapia Sistêmica",
    "Psicologia Humanista",
  ];

  return (
    <div className="flex items-center gap-4">
      <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Filtrar por especialidade" />
        </SelectTrigger>
        <SelectContent>
          {specialties.map((specialty) => (
            <SelectItem key={specialty} value={specialty}>
              {specialty}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
