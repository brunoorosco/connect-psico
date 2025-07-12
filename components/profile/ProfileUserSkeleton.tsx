// components/skeletons/ProfileSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton"

export const ProfileSkeleton = () => {
  return (
    <div className="container mx-auto py-6 max-w-5xl space-y-6">
      <Skeleton className="h-8 w-1/3" /> {/* Título */}
      <Skeleton className="h-4 w-1/2" /> {/* Subtítulo */}
      <div className="p-6 border rounded-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />

            <div className="flex gap-4">
              <div className="w-3/4 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <Skeleton className="w-32 h-32 rounded-full" />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}
