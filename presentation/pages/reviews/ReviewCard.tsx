import RatingStars from "./RatingStars"

interface Review {
  id: string
  profissionalName?: string
  rating: number
  comment: string
  createdAt: string
}

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="border rounded-lg p-4">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h3 className="font-semibold">{review.profissionalName}</h3>
        <div className="flex items-center gap-2 mt-1">
          <RatingStars rating={review.rating} />
          <span className="text-sm text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
    <p className="text-gray-700">{review.comment}</p>
  </div>
)

export default ReviewCard
