import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Calendar, Edit } from "lucide-react";
import { IPatientHeader } from "./types";

export const PatientHeader: React.FC<IPatientHeader> = ({
  patient,
  onBack,
  onEdit,
  onSendMessage,
  onSchedule,
}) => {
  if (!patient) {
    return <p>Carregando informações do paciente...</p>;
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-xl">{patient.name}</CardTitle>
              <p className="text-gray-600">
                {patient.medicalRecordId && `Prontuário: ${patient.medicalRecordId}`}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onSendMessage}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Mensagem
            </Button>
            <Button variant="outline" onClick={onSchedule}>
              <Calendar className="h-4 w-4 mr-2" />
              Agendar
            </Button>
            <Button onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
