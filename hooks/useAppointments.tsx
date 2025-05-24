import { getAppointmentsByPatient, getAppointmentsUsers,   } from "@/actions/appointments";
import { useState, useTransition } from "react";

export function useAppointments() {
  const [appointments, setAppointments] = useState<any>([]);
  const [total, setTotal] = useState(0);
  const [loading, startTransition] = useTransition();

  const fetchAppointments = async (page = 1, limit = 10) => {
    startTransition(async () => {
      const res = await getAppointmentsUsers({ page, limit });
      setAppointments(res);
      setTotal(res.total);
    });
  };
  return { appointments: appointments.data, total, loading, fetchAppointments };
}

export function useAppointmentsByPatient() {
  const [appointments, setAppointments] = useState<any>([]);
  const [total, setTotal] = useState(0);
  const [loading, startTransition] = useTransition();

  const fetchAppointments = async (page = 1, limit = 10) => {
    startTransition(async () => {
      const res = await getAppointmentsByPatient({ page, limit });
      setAppointments(res);
      setTotal(res.total);
    });
  };
  return { appointments: appointments.data, total, loading, fetchAppointments };
}

export function useAppointmentsByProfessional() {
  const [appointments, setAppointments] = useState<any>([]);
  const [total, setTotal] = useState(0);
  const [loading, startTransition] = useTransition();

  const fetchAppointments = async (page = 1, limit = 10) => {
    startTransition(async () => {
      const res = await getAppointmentsUsers({ page, limit });
      setAppointments(res);
      setTotal(res.total);
    });
  };
  return { appointments: appointments.data, total, loading, fetchAppointments };
}