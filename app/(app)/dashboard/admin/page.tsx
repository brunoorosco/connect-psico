'use client'
import PatientDashboard from "@/components/dashboard/DashboardDefault";
import PsychologistDashboard from "@/components/dashboard/PsyDashboard";
import RoleToggle from "@/components/dashboard/RoleToggle";
import { useState } from "react";

const DashboardPageAdmin = () => {
  const [role, setRole] = useState<"SUPERVISOR" | "DEFAULT">("SUPERVISOR");
  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {role === "SUPERVISOR" ? <PsychologistDashboard /> : <PatientDashboard />} 
       </div>
      <RoleToggle currentRole={role} onRoleChange={setRole} />
    </div>
  );
};

export default DashboardPageAdmin;
