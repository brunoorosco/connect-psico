// components/AdminTableLayout.tsx
import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import PaginationControls from "@/components/PaginationControls";

interface Props {
  title: string;
  search: string;
  setSearch: (val: string) => void;
  searchPlaceholder?: string;
  limit: number;
  setLimit: (val: number) => void;
  page: number;
  setPage: (val: number) => void;
  totalPages: number;
  loading: boolean;
  children: ReactNode;
}

export const AdminTableLayout = ({
  title,
  search,
  setSearch,
  searchPlaceholder = "Buscar...",
  limit,
  setLimit,
  page,
  setPage,
  totalPages,
  loading,
  children,
}: Props) => {
  return (
    <div className="space-y-6">
      {/* Título + Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold text-center sm:text-left">
          {title}
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:w-full sm:max-w-md">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full"
          />

          <Select
            value={limit.toString()}
            onValueChange={(val) => {
              setLimit(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Itens por página" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 por página</SelectItem>
              <SelectItem value="10">10 por página</SelectItem>
              <SelectItem value="25">25 por página</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Carregando ou Conteúdo */}
      {loading ? (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {children}
          {totalPages > 1 && (
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};
