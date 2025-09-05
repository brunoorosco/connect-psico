import { CardHeader, CardContent } from "@/components/ui/card"
import ReviewCard from "./ReviewCard"

type ReviewWithName = {
  id: string
  rating: number
  comment: string
  createdAt: string
  profissionalId: string
  profissionalName: string
}

type Props = { reviews: ReviewWithName[] }

const ReviewList = ({ reviews }: Props) => (
  <>
    <CardHeader>
      <h2 className="text-2xl font-semibold">Minhas Avaliações</h2>
    </CardHeader>
    <CardContent>
      {reviews.length === 0 ? (
        <p className="text-muted-foreground">Você ainda não fez nenhuma avaliação.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={ review } />
          ))}
        </div>
      )}
    </CardContent>
  </>
)

export default ReviewList
