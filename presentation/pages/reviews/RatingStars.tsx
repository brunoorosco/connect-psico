import { Star } from "lucide-react"

interface Props {
  rating: number
  interactive?: boolean
  onChange?: (rating: number) => void
}

const RatingStars = ({ rating, interactive = false, onChange }: Props) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-5 w-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} ${
          interactive ? "cursor-pointer hover:text-yellow-400" : ""
        }`}
        onClick={interactive && onChange ? () => onChange(star) : undefined}
      />
    ))}
  </div>
)

export default RatingStars
