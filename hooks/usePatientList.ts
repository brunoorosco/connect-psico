// hooks/usePatientList.ts
import { useCallback } from "react";
import { Patient } from "@/types/appointment";

export function usePatientList({
  onViewPatient,
  onEditPatient,
  onDeletePatient
}: {
  onViewPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: number) => void;
}) {
  const handleView = useCallback(
    (patient: Patient) => {
      onViewPatient(patient);
    },
    [onViewPatient]
  );

  const handleEdit = useCallback(
    (data: Patient) => {
      onEditPatient(data);
    },
    [onEditPatient]
  );

  const handleDelete = useCallback(
    (id: number) => {
      onDeletePatient(id);
    },
    [onDeletePatient]
  );

  const handleSendMessage = useCallback((patient: Patient) => {
    // Lógica real de envio pode vir de outro hook depois
    console.log("Enviando mensagem para:", patient.name);
  }, []);

  return { handleView, handleEdit, handleDelete, handleSendMessage };
}
