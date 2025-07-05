"use client";

import { startTransition, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PatientHeader } from "@components/consulta/PatientHeader";
import { ConsultationDateTimeEditor } from "@components/consulta/ConsultationDateTimeEditor";
import { ClinicalEvolution } from "@components/consulta/ClinicalEvolution";
import { AiSummary } from "@components/consulta/AISummary";
import { Prescription } from "@components/consulta/Prescription";
import { usePatientStore } from "@/stores/usePatientStore";
import { ConsultaSkeleton } from "@components/skeletons";
import { getPatientByUserId } from "@/actions/patients/getPatientByUserId";

export const ConsultationStart = () => {
  const router = useRouter();
  const params = useParams();
  const { patientId } = params;
  const setPatient = usePatientStore((state) => state.setPatient);
  const patient = usePatientStore((state) => state.patient);
  const [consultationDate, setConsultationDate] = useState(new Date());
  const [consultationTime, setConsultationTime] = useState("14:00");
  const [clinicalEvolution, setClinicalEvolution] = useState("");
  const [prescription, setPrescription] = useState("");
  const [isEditingDateTime, setIsEditingDateTime] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (patient && patient.userId === patientId) {
      setIsChecking(false);
      return;
    }

    try {
      startTransition(async () => {
        const data = await getPatientByUserId(patientId as string);
        if (data && "id" in data && "name" in data) {
          setPatient(data);
        } else {
          console.warn("Paciente não encontrado!");
          router.push("/pacientes");
        }
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
    }

    setIsChecking(false); // ✅ Só exibe UI depois da verificação
  }, [patient, router]);

  if (isChecking) return <ConsultaSkeleton />;

  const handleSaveConsultation = () => {
    console.log("Salvar consulta:", {
      patient,
      consultationDate,
      consultationTime,
      clinicalEvolution,
      prescription,
    });

    router.push("/");
  };

  return (
    patient && (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button onClick={() => router.back()} variant="ghost" size="sm" className="mr-2">
              <span className="mr-1">←</span>
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Consulta em Andamento</h1>
          </div>

          {/* Patient Header */}
          <Card className="mb-6 border-l-4 border-therapy-primary p-4">
            <PatientHeader
              name={patient.name}
              // age={patient.age}
              // gender={patient.gender}
              // diagnosis={patient.diagnosis}
              date={consultationDate}
              time={consultationTime}
              isEditing={isEditingDateTime}
              onEditToggle={() => setIsEditingDateTime(true)}
            />
            {isEditingDateTime && (
              <div className="mt-4">
                <ConsultationDateTimeEditor
                  date={consultationDate}
                  time={consultationTime}
                  onChangeDate={setConsultationDate}
                  onChangeTime={setConsultationTime}
                  onConfirm={() => setIsEditingDateTime(false)}
                />
              </div>
            )}
          </Card>

          {/* AI Summary */}
          <AiSummary />

          {/* Clinical Evolution */}
          <ClinicalEvolution value={clinicalEvolution} onChange={setClinicalEvolution} />

          {/* Prescription */}
          <Prescription value={prescription} onChange={setPrescription} />

          <div className="flex justify-end mt-4 gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveConsultation}
              className="bg-therapy-primary hover:bg-therapy-tertiary transition-colors"
            >
              Finalizar Consulta
            </Button>
          </div>
        </div>
      </div>
    )
  );
};

export default ConsultationStart;
