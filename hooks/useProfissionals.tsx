"use client";

import { getProfessionalUsers } from "@/actions/users";
import { getProfessionalSchedule } from "@/actions/users/getGapIntervalsProfessional";
import { getProfessionalAvailabilities } from "@/actions/users/getProfessionalAvailabities";
import { getProfessioanlById } from "@/actions/users/getProfessionalById";
import { ProfessionalModel } from "@/domain/model/professional";
import { Professional } from "@/types/appointment";
import { useCallback, useState, useTransition } from "react";
import useSWR from 'swr';


export function useProfessionalsFetcher() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, startTransition] = useTransition();

  const fetchProfessionals = useCallback(
    (page = 1, limit = 10, specialty?: string) => {
      startTransition(async () => {
        try {
          const res = await getProfessionalUsers({ page, limit, specialty });
          //@ts-ignore
          setProfessionals(res.data);
          setTotal(res.total);
        } catch (error) {
          console.error("Erro ao buscar profissionais:", error);
          setProfessionals([]);
          setTotal(0);
        }
      });
    },
    []
  );

  return { professionals, total, loading, fetchProfessionals };
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
    user: data as ProfessionalModel,
    loading: isLoading,
    error,
    refresh: mutate
  };
}
