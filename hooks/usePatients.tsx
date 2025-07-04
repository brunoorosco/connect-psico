"use client";

import { getPatientUsers } from "@/actions/users";
import { getProfessionalSchedule } from "@/actions/users/getGapIntervalsProfessional";
import { getProfessionalAvailabilities } from "@/actions/users/getProfessionalAvailabities";
import { useState, useTransition } from "react";
import { Patient } from '@/types/appointment';
import { mockAppointments } from "@components/agenda/mockData";

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
  return { disponibilidadeProfissional:professional, loading, fetchProfessional };
}

export const fetchProfessionalSchedule = async (userId: string, date: Date) => {
  return await getProfessionalSchedule(userId, date);
};

export function usePatientDetails(patient: Patient) {
  const patientAppointments = mockAppointments.filter(
    (apt) => apt.patientId === patient.userId
  );

  const handleSendMessage = () => {
    console.log('Enviando mensagem para:', patient.name);
  };

  const handleScheduleAppointment = () => {
    console.log('Agendando consulta para:', patient.name);
  };

  return {
    patientAppointments,
    handleSendMessage,
    handleScheduleAppointment,
  };
}
