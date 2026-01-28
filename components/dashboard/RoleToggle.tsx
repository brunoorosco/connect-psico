import React from "react";
import { Button } from "@/components/ui/button";

interface RoleToggleProps {
  currentRole: "SUPERVISOR" | "DEFAULT";
  onRoleChange: (role: "SUPERVISOR" | "DEFAULT") => void;
}

const RoleToggle: React.FC<RoleToggleProps> = ({ currentRole, onRoleChange }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-primary rounded-lg shadow-lg p-1">
      <div className="flex items-center">
        <Button
          variant={currentRole === "SUPERVISOR" ? "default" : "ghost"}
          size="sm"
          onClick={() => onRoleChange("SUPERVISOR")}
          className={`text-sm ${
            currentRole === "SUPERVISOR" 
              ? "bg-white text-therapy-tertiary" 
              : "bg-transparent text-white hover:bg-white/20"
          }`}
        >
          Psicólogo
        </Button>
        <Button
          variant={currentRole === "DEFAULT" ? "default" : "ghost"}
          size="sm"
          onClick={() => onRoleChange("DEFAULT")}
          className={`text-sm ${
            currentRole === "DEFAULT" 
              ? "bg-white text-therapy-tertiary" 
              : "bg-transparent text-white hover:bg-white/20"
          }`}
        >
          Paciente
        </Button>
      </div>
    </div>
  );
};

export default RoleToggle;
