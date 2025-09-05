import { Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  onToggleForm: () => void
  showForm: boolean
  professional: boolean
}

const ReviewsHeader = ({ onToggleForm, showForm, professional }: Props) => (
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-3xl font-bold flex items-center gap-2">
      <Star className="h-8 w-8" />
      Avaliações e Comentários
    </h1>
    {professional && (
      <Button onClick={onToggleForm} className="flex items-center gap-2">
        {showForm ? (
          "Fechar"
        ) : (
          <>
            <Plus className="h-5 w-5" /> Nova Avaliação
          </>
        )}
      </Button>
    )}
  </div>
)

export default ReviewsHeader
