"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { useToast } from "@hooks/useToast"
import { useCurrentUser } from "@hooks/use-current-user"
import ReviewsHeader from "./ReviewsHeader"
import ReviewForm from "./ReviewForm"
import ReviewList from "./ReviewList"
import { Review } from "@/domain/model/review"
import { getReviewsByUserIdService, reviewOpenByAppointmentService } from "@services/review"

type Profissional = { id: string; name: string }
type ReviewWithName = Review & { professionalName: string }

const ReviewsPage = () => {
  const [profissional, setProfissional] = useState<Profissional[]>([])
  const [reviews, setReviews] = useState<ReviewWithName[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const user = useCurrentUser()

  useEffect(() => {
    fetchProfissionalAndReviews()
  }, [])

  const fetchProfissionalAndReviews = async () => {
    try {
      if (!user) return

      const { appointments, profissional } = await reviewOpenByAppointmentService(user.id as string)
      const { data: reviewsData } = await getReviewsByUserIdService(user?.id as string)
      setProfissional(profissional)

      if (reviewsData) {
        setReviews(reviewsData)
        console.log(reviewsData)
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <ReviewsHeader
        onToggleForm={() => setShowForm(!showForm)}
        showForm={showForm}
        professional={profissional.length > 0}
      />

      {showForm && (
        <Card className="mb-6">
          <ReviewForm
            profissional={profissional}
            onSuccess={() => {
              setShowForm(false)
              fetchProfissionalAndReviews()
            }}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      <Card>
        <ReviewList reviews={reviews} />
      </Card>
    </div>
  )
}

export default ReviewsPage
