import { Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  onToggleForm: () => void
  showForm: boolean
}

const ReviewsHeader = ({ onToggleForm, showForm }: Props) => (
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-3xl font-bold flex items-center gap-2">
      <Star className="h-8 w-8" />
      Avaliações e Comentários
    </h1>
    <Button onClick={onToggleForm} className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      {showForm ? "Fechar" : "Nova Avaliação"}
    </Button>
  </div>
)

export default ReviewsHeader
