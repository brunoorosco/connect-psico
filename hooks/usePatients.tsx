"use client";

import { getPatientUsers } from "@/actions/users";
import { getProfessionalSchedule } from "@/actions/users/getGapIntervalsProfessional";
import { useState, useTransition } from "react";
import { usePatientAppointments } from "./useAppointments";
import { PatientModel } from "@/domain/model/patient";

export function usePatientsFetcher() {
  const [userDefault, setUserDefault] = useState<any>([]);
  const [total, setTotal] = useState(0);
  const [loading, startTransition] = useTransition();

  const fetchProfessionals = async (page = 1, limit = 10) => {
    startTransition(async () => {
      const res = await getPatientUsers({ page, limit });
      setUserDefault(res);
      setTotal(res.total);
    });
  };
  return { professionals: userDefault.data, total, loading, fetchProfessionals };
}

export const fetchProfessionalSchedule = async (userId: number, date: Date) => {
  return await getProfessionalSchedule(userId, date);
};

export function usePatientDetails(patient: PatientModel) {
  const handleSendMessage = () => {
    console.log("Enviando mensagem para:", patient.name);
  };

  const handleScheduleAppointment = () => {
    console.log("Agendando consulta para:", patient.name);
  };

  const { appointments, fetchAppointments, isLoading } = usePatientAppointments(patient?.patientId as string);

  return {
    patientAppointments: appointments,
    fetchAppointments,
    isAppointmentsLoading: isLoading,
    handleSendMessage,
    handleScheduleAppointment,
  };
}
