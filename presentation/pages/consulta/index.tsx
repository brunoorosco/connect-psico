"use client";

import { useEffect, useState, startTransition } from "react";
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
import { useConsultationForm } from "@/hooks/useConsultation";

export const ConsultationStart = () => {
  const router = useRouter();
  const params = useParams();
  const { patientId, id } = params as { patientId: string; id: string };

  const setPatient = usePatientStore((state) => state.setPatient);
  const patient = usePatientStore((state) => state.patient);

  const [consultationDate, setConsultationDate] = useState(new Date());
  const [consultationTime, setConsultationTime] = useState("14:00");
  const [isEditingDateTime, setIsEditingDateTime] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinicalEvolution, setClinicalEvolution] = useState("");
  const [prescription, setPrescription] = useState("");

  const { form, handleSubmit } = useConsultationForm({});

  // Buscar paciente
  useEffect(() => {
    const fetchPatient = async () => {
      if (patient?.userId === patientId) {
        setIsChecking(false);
        return;
      }

      try {
        const data = await getPatientByUserId(patientId);
        if (data && "id" in data && "name" in data) {
          setPatient(data);
        } else {
          router.push("/pacientes");
        }
      } catch (error) {
        console.error("Erro ao buscar paciente:", error);
      } finally {
        setIsChecking(false);
      }
    };

    startTransition(fetchPatient);
  }, [patientId]);

  const handleFinishConsultation = async () => {
    setIsSubmitting(true);
    try {
      await handleSubmit({
        notes: clinicalEvolution,
        prescription,
        patientId: patient?.id ?? 0,
        professionalId: id,
      });
    } catch (error) {
      console.error("Erro ao finalizar consulta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) return <ConsultaSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button onClick={() => router.back()} variant="ghost" size="sm" className="mr-2">
            <span className="mr-1">←</span>Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Consulta em Andamento</h1>
        </div>

        {/* Header do paciente */}
        <Card className="mb-6 border-l-4 border-therapy-primary p-4">
          <PatientHeader
            name={patient?.name ?? ""}
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

        {/* Componentes da consulta */}
        <AiSummary />

        <ClinicalEvolution value={clinicalEvolution} onChange={setClinicalEvolution} />

        <Prescription value={prescription} onChange={setPrescription} />

        <div className="flex justify-end mt-4 gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button
            onClick={handleFinishConsultation}
            disabled={!clinicalEvolution || isSubmitting}
            className="bg-therapy-primary hover:bg-therapy-tertiary transition-colors"
          >
            {isSubmitting ? "Salvando..." : "Finalizar Consulta"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationStart;
