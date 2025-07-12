"use client";

import { Users, Calendar, CheckCircle, AlertCircle, UserCheck, Monitor, Clock } from "lucide-react";
import StatsCard from "./StatsCard";
import { useAppointmentsTotal, useTotalPatients } from "./useDashboard";
import { Skeleton } from "@components/ui/skeleton";

const KpiCards = () => {
  const { totalAppointment, loading: loadingAppointments } = useAppointmentsTotal();
  const { totalPatients, loading: loadingPatients } = useTotalPatients();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div>
          {loadingPatients ? (
            <Skeleton className="w-[100px] h-[30px]" />
          ) : (
            <StatsCard
              title="Total de Pacientes"
              value={totalPatients || 0}
              icon={Users}
              // description="+8% em relação ao mês anterior"
              trend="up"
            />
          )}
        </div>

        <StatsCard
          title="Consultas Realizadas"
          value={0}
          icon={CheckCircle}
          // description="+8% em relação ao mês anterior"
          trend="up"
        />
        <StatsCard
          title="Consultas Agendadas"
          value={0}
          icon={Calendar}
          description="Próximas 30 dias"
        />
        <StatsCard
          title="Consultas Pendentes"
          value={0}
          icon={AlertCircle}
          description="Aguardando confirmação"
          trend="neutral"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          {loadingAppointments ? (
            <Skeleton className="w-[100px] h-[30px]" />
          ) : (
            <StatsCard
              title="Total de Consultas"
              value={totalAppointment || 0}
              icon={UserCheck}
              description="Histórico completo"
            />
          )}
        </div>

        <StatsCard
          title="Atendimento Remoto"
          value={0}
          icon={Monitor}
          description={`${Math.round((0 / 100) * 100)}% do total`}
        />

        <StatsCard
          title="Atendimento Presencial"
          value={0}
          icon={Clock}
          description={`${Math.round((0 / 100) * 100)}% do total`}
        />
      </div>
    </>
  );
};

export default KpiCards;
