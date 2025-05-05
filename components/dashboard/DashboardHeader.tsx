import React from "react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { ptBR } from "date-fns/locale";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  userRole: "SUPERVISOR" | "DEFAULT";
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  userRole,
}) => {
  const isMobile = useIsMobile();
  const today = new Date();
  
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-gray-500">{subtitle}</p>}
        </div>
        <div className="mt-2 md:mt-0">
          <div className="px-4 py-2 rounded-lg bg-therapy-light text-therapy-tertiary font-medium">
            {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <div className="w-2 h-2 rounded-full bg-therapy-primary mr-2"></div>
        <span className="text-sm text-gray-500 capitalize">{userRole === "SUPERVISOR" ? "Visão de Psicólogo" : "Visão de Paciente"}</span>
      </div>
    </div>
  );
};

export default DashboardHeader;