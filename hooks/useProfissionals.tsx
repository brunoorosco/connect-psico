"use client";

import { getProfessionalUsers } from "@/actions/users";
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
