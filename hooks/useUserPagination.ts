// hooks/useUserPagination.ts
import { getAllUsers } from "@/actions/users";
import { useState, useEffect } from "react";

// hooks/useUserPagination.ts
export const useUserPagination = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<"name" | "email" | "createdAt">("name");
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data, total } = await getAllUsers({ page, limit, search, order, orderBy });
        setUsers(data);
        setTotal(total);
        console.log(total)
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [page, search, order, orderBy, limit]);

 const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    users,
    total,
    page,
    limit,
    search,
    setSearch,
    order,
    setOrder,
    orderBy,
    setOrderBy,
    setPage,
     setLimit, 
    totalPages,
    loading,
  };
};
