"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import { TherapistFilter } from "@/components/profissional/TherapistFilter"
import { ProfessionalCard } from "@/components/profissional/TherapistCard"
import { ProfessionalDetailsModal } from "@/components/profissional/TherapistDetails"
import { useSession } from "next-auth/react"
import { useProfessionalsFetcher } from "@/hooks/useProfissionals"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { Button } from "@components/ui/button"

const PAGE_SIZE_OPTIONS = [6, 10, 20]

const FindTherapist = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("")
  const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null)
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(6)

  const navigate = useRouter()
  const { data: session, status } = useSession()

  const { professionals, total, loading, fetchProfessionals } = useProfessionalsFetcher()

  useEffect(() => {
    fetchProfessionals(page, limit, selectedSpecialty)
  }, [page, limit, selectedSpecialty])

  const totalPages = Math.ceil(total / limit)

  const onSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty)
    setPage(1)
  }
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex flex-col lg:flex-row justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold text-therapy-primary">Encontre seu Terapeuta</h1>
          <TherapistFilter selectedSpecialty={selectedSpecialty} onSpecialtyChange={onSpecialtyChange} />
        </div>

        {/* Paginação e seleção limit */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="font-medium">
                Itens por página:
              </label>
              <Select
                value={limit.toString()}
                onValueChange={(val) => {
                  setLimit(Number(val))
                  setPage(1)
                }}
              >
                <SelectTrigger id="pageSize" className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt.toString()}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span>
                Página {page} de {totalPages || 1}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? (
            Array.from({ length: limit }).map((_, index) => <TherapistCardSkeleton key={index} />)
          ) : Array.isArray(professionals) && professionals.length > 0 ? (
            professionals.map((therapist: any) => (
              <ProfessionalCard
                key={therapist.id}
                professional={therapist}
                onSelect={() => setSelectedTherapist(therapist)}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">Nenhum terapeuta encontrado.</p>
          )}
        </div>

        <ProfessionalDetailsModal
          open={selectedTherapist !== null}
          onOpenChange={() => setSelectedTherapist(null)}
          professional={selectedTherapist}
        />
      </div>
    </>
  )
}

export default FindTherapist

const TherapistCardSkeleton = () => {
  return (
    <div className="animate-pulse rounded-xl border p-4 shadow-md space-y-4 bg-white">
      <div className="h-32 bg-gray-200 rounded-md" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-6 bg-gray-200 rounded w-full" />
    </div>
  )
}
