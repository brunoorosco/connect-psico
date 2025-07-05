// components/skeletons/ConsultaSkeleton.tsx

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ConsultaSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 animate-pulse">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>

        {/* Card do paciente */}
        <Card className="p-4 border-l-4 border-therapy-primary space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </Card>

        {/* Resumo IA */}
        <Card className="p-4 space-y-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </Card>

        {/* Evolução clínica */}
        <Card className="p-4 space-y-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-24 w-full rounded-md" />
        </Card>

        {/* Receituário */}
        <Card className="p-4 space-y-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-20 w-full rounded-md" />
        </Card>

        {/* Botões */}
        <div className="flex justify-end gap-3">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default ConsultaSkeleton;
