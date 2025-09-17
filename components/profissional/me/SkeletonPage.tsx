"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import Navbar from "@/components/layout/Navbar"
import { LoginModal } from "@components/profissional/me/LoginModal"
import { useState } from "react"

/**
 * Skeleton page for ProfessionalProfilePage
 * Mirrors the layout of the real page using shadcn/ui <Skeleton />
 * Drop-in while the profile + schedule are loading.
 */
export default function ProfessionalProfilePageSkeleton() {
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna esquerda */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-32 w-32 rounded-full overflow-hidden">
                    <Skeleton className="h-full w-full rounded-full" />
                  </div>

                  <div className="w-full space-y-3">
                    <Skeleton className="h-6 w-48 mx-auto" />

                    {/* education list */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-60 mx-auto" />
                      <Skeleton className="h-4 w-44 mx-auto" />
                    </div>

                    {/* badge */}
                    <div className="flex justify-center">
                      <Skeleton className="h-7 w-40 rounded-full" />
                    </div>

                    {/* rating */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-10" />
                      <Skeleton className="h-4 w-20" />
                    </div>

                    {/* location */}
                    <div className="flex items-center justify-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-28" />
                    </div>

                    {/* público alvo + experiência */}
                    <div className="space-y-2 mt-3">
                      <Skeleton className="h-4 w-24 mx-auto" />
                      <Skeleton className="h-4 w-64 mx-auto" />
                      <Skeleton className="h-4 w-40 mx-auto" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-24" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-28" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-60" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-56" />
              </CardContent>
            </Card>
          </div>

          {/* Coluna direita */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-5 w-44" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[85%]" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-56" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Week navigator */}
                <div className="mb-4 flex items-center gap-3">
                  <Skeleton className="h-9 w-10 rounded-md" />
                  <Skeleton className="h-9 w-44 rounded-md" />
                  <Skeleton className="h-9 w-10 rounded-md" />
                  <div className="ml-auto">
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>

                {/* Schedule grid placeholder */}
                <ScheduleGridSkeleton />

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3 h-3 rounded border" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3 h-3 rounded" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="ml-auto">
                      <Skeleton className="h-4 w-56" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-72 mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Keep modal mounted so layout matches */}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}

function ScheduleGridSkeleton() {
  // 7 dias (seg → dom), 11 horários (08:00 → 18:00) como no original
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
  const hours = Array.from({ length: 11 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`)

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[720px]">
        {/* Cabeçalho com os dias */}
        <div className="grid" style={{ gridTemplateColumns: `100px repeat(7, minmax(0, 1fr))` }}>
          <div />
          {days.map((d, i) => (
            <div key={i} className="px-2 py-2 text-center">
              <Skeleton className="h-4 w-14 mx-auto" />
            </div>
          ))}
        </div>

        {/* Linhas de horários */}
        <div className="divide-y">
          {hours.map((h, rowIdx) => (
            <div
              key={rowIdx}
              className="grid items-center"
              style={{ gridTemplateColumns: `100px repeat(7, minmax(0, 1fr))` }}
            >
              {/* coluna da hora */}
              <div className="px-2 py-2">
                <Skeleton className="h-4 w-12" />
              </div>
              {/* células de disponibilidade */}
              {Array.from({ length: 7 }).map((_, colIdx) => (
                <div key={colIdx} className="px-2 py-2">
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
