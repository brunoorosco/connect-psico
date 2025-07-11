// hooks/useInPersonConsultations.ts
"use client";

import { useEffect, useState } from "react";
import { countAppointmentsByProfessional } from "@/actions/appointments/countAppointmentByProfessional";
import { countPatientsByProfessionalId } from "@/actions/patients/countPatientsByProfessional";

function useAsync<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    const fetch = async () => {
      try {
        const result = await fn();
        if (active) setData(result);
      } catch (err) {
        if (active) setError(err as Error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetch();
    return () => {
      active = false;
    };
  }, [fn]);

  return { data, loading, error };
}

export const useTotalPatients = () => {
  const { data, loading, error } = useAsync(async () => {
    const result = await countPatientsByProfessionalId();
    return result.total;
  });

  return { totalPatients: data, loading, error };
};

export const useAppointmentsTotal = () => {
  const { data, loading, error } = useAsync(async () => {
    const result = await countAppointmentsByProfessional();
    return result.total;
  });

  return { totalAppointment: data, loading, error };
};
