"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { useToast } from "@hooks/useToast"
import { useCurrentUser } from "@hooks/use-current-user"
import ReviewsHeader from "./ReviewsHeader"
import ReviewForm from "./ReviewForm"
import ReviewList from "./ReviewList"
import { Review, Therapist } from "./types"

const ReviewsPage = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const user = useCurrentUser()

  useEffect(() => {
    fetchTherapistsAndReviews()
  }, [])

  const fetchTherapistsAndReviews = async () => {
    try {
      if (!user) return

      // mock para exemplo
      const therapistData: Therapist[] = [
        { id: "00000000-0000-0000-0000-000000000001", name: "Dra. Maria Silva" },
        { id: "00000000-0000-0000-0000-000000000002", name: "Dr. João Santos" },
      ]
      setTherapists(therapistData)

      // buscar reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*")
        .eq("patient_id", user?.id)
        .order("created_at", { ascending: false })

      if (reviewsData) {
        const withNames = reviewsData.map((review) => ({
          ...review,
          therapist_name: therapistData.find((t) => t.id === review.therapist_id)?.name || "Desconhecido",
        }))
        setReviews(withNames)
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
      <ReviewsHeader onToggleForm={() => setShowForm(!showForm)} showForm={showForm} />

      {showForm && (
        <Card className="mb-6">
          <ReviewForm
            therapists={therapists}
            onSuccess={() => {
              setShowForm(false)
              fetchTherapistsAndReviews()
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
