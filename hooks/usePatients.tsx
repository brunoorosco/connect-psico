"use client";

import { getPatientUsers } from "@/actions/users";
import { getProfessionalSchedule } from "@/actions/users/getGapIntervalsProfessional";
import { getProfessionalAvailabilities } from "@/actions/users/getProfessionalAvailabities";
import { useEffect, useState, useTransition } from "react";
import { Patient } from "@/types/appointment";
import { getAppointmentsByPatient, getAppointmentsByUserId } from "@/actions/appointments";
import { usePatientAppointments } from "./useAppointments";

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

export function useProfessionalsAvaliabilitiesFetcher() {
  const [professional, setProfessional] = useState<any>([]);
  const [loading, startTransition] = useTransition();

  const fetchProfessional = async (userId: string) => {
    startTransition(async () => {
      const res = await getProfessionalAvailabilities(userId);
      setProfessional(res);
    });
  };
  return { disponibilidadeProfissional: professional, loading, fetchProfessional };
}

export const fetchProfessionalSchedule = async (userId: string, date: Date) => {
  return await getProfessionalSchedule(userId, date);
};

export function usePatientDetails(patient: Patient) {
  const handleSendMessage = () => {
    console.log("Enviando mensagem para:", patient.name);
  };

  const handleScheduleAppointment = () => {
    console.log("Agendando consulta para:", patient.name);
  };

  const { appointments, fetchAppointments, isLoading } = usePatientAppointments(patient?.userId);

  return {
    patientAppointments: appointments,
    fetchAppointments,
    isAppointmentsLoading: isLoading,
    handleSendMessage,
    handleScheduleAppointment,
  };
}
