"use client";

import { getProfessionalUsers } from "@/actions/users";
import { getProfessionalSchedule } from "@/actions/users/getGapIntervalsProfessional";
import { getProfessionalAvailabilities } from "@/actions/users/getProfessionalAvailabities";
import { useState, useTransition } from "react";

export function useProfessionalsFetcher() {
  const [professionals, setProfessionals] = useState<any>([]);
  const [total, setTotal] = useState(0);
  const [loading, startTransition] = useTransition();

  const fetchProfessionals = async (page = 1, limit = 10) => {
    startTransition(async () => {
      const res = await getProfessionalUsers({ page, limit });
      setProfessionals(res);
      setTotal(res.total);
    });
  };
  return { professionals: professionals.data, total, loading, fetchProfessionals };
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

export function useAgendaProfissional() {
  const [professional, setProfessional] = useState<any>([]);
  const [loading, startTransition] = useTransition();

  const fetchProfessional = async (userId: string, date: Date) => {
    startTransition(async () => {
      const res = await getProfessionalSchedule(userId, date);
      setProfessional(res);
    });
  };
  return { agendaProfissional:professional, loading, fetchProfessional };
}
