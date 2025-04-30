import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PatientInfo {
  id: number;
  name: string;
  age: number;
  gender: string;
  contactInfo: string;
  initialConsultation: string;
  diagnosis?: string;
  notes: string[];
}

interface PatientRecordProps {
  patient: PatientInfo;
}

const PatientRecord: React.FC<PatientRecordProps> = ({ patient }) => {
  return (
    <Card className="therapy-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-therapy-tertiary">
          Prontuário do Paciente
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg">{patient.name}</h3>
            <div className="flex text-sm text-gray-500 gap-2">
              <span>{patient.age} anos</span>
              <span>•</span>
              <span>{patient.gender}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">{patient.contactInfo}</div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Primeira consulta</h4>
            <p className="text-sm">{patient.initialConsultation}</p>
          </div>
          
          {patient.diagnosis && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-1">Diagnóstico</h4>
                <p className="text-sm">{patient.diagnosis}</p>
              </div>
            </>
          )}
          
          <Separator />
          
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Notas recentes
            </h4>
            <div className="space-y-2">
              {patient.notes.map((note, index) => (
                <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientRecord;