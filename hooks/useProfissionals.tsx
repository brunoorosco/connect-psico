"use client";

import { getProfessionalUsers } from "@/actions/users";
import { getProfessionalSchedule } from "@/actions/users/getGapIntervalsProfessional";
import { getProfessionalAvailabilities } from "@/actions/users/getProfessionalAvailabities";
import { getProfessioanlById } from "@/actions/users/getProfessionalById";
import { useState, useTransition } from "react";
import useSWR from 'swr';


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

export const fetchProfessionalSchedule = async (userId: string, date: Date) => {
  return await getProfessionalSchedule(userId, date);
};


const fetchProfessional = (userId: string) => getProfessioanlById(userId);

export function useGetProfessionalById(userId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/professional/${userId}` : null,
    () => fetchProfessional(userId!)
  );

  return {
    user: data,
    loading: isLoading,
    error,
    refresh: mutate
  };
}
