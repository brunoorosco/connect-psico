import { useEffect, useState } from "react"
import { Loader2, Ban, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUserPagination } from "@/hooks/useUserPagination"
import { AdminTableLayout } from "./AdminTableLayout"

const AdminUserTable = () => {
  const { toast } = useToast()
  const {
    users,
    search,
    setSearch,
    order,
    setOrder,
    page,
    setPage,
    totalPages,
    loading,
    orderBy,
    limit,
    setOrderBy,
    setLimit,
  } = useUserPagination()

  const [processingUsers, setProcessingUsers] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const toggleUserBlock = async (userId: string, currentBlockStatus: boolean) => {
    setProcessingUsers((prev) => ({ ...prev, [userId]: true }))
    try {
      toast({
        title: "Usuário atualizado",
        description: `Usuário ${!currentBlockStatus ? "bloqueado" : "desbloqueado"} com sucesso!`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário",
        variant: "destructive",
      })
    } finally {
      setProcessingUsers((prev) => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <AdminTableLayout
      title="Gerenciar Permissões"
      search={search}
      setSearch={setSearch}
      searchPlaceholder="Buscar por nome e email..."
      limit={limit}
      setLimit={setLimit}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      loading={loading}
    >
      {/* Tabela - visível apenas em telas maiores */}
      <div className="hidden sm:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => {
                  setOrderBy("name")
                  setOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  setPage(1)
                }}
              >
                Nome {orderBy === "name" && (order === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.role === "ADMIN" ? "destructive" : user.role === "SUPERVISOR" ? "secondary" : "outline"
                    }
                  >
                    {user.role === "ADMIN" ? "Admin" : user.role === "SUPERVISOR" ? "Supervisor" : "Usuário"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.active ? "default" : "destructive"}
                    className={user.active ? "bg-green-600" : ""}
                  >
                    {user.active ? "Ativo" : "Bloqueado"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant={user.active ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => toggleUserBlock(user.id, user.active)}
                    disabled={processingUsers[user.id]}
                  >
                    {processingUsers[user.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.active ? (
                      <>
                        <Check className="mr-1 h-4 w-4" /> Bloquear
                      </>
                    ) : (
                      <>
                        <Ban className="mr-1 h-4 w-4" /> Desbloquear
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile layout - cards */}
      <div className="sm:hidden space-y-4 px-4">
        {users.map((user) => (
          <div key={user.id} className="w-full border rounded-lg p-4 shadow-sm space-y-2 bg-white dark:bg-zinc-900">
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                Criado em {new Date(user.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant={user.role === "ADMIN" ? "destructive" : user.role === "SUPERVISOR" ? "secondary" : "outline"}
              >
                {user.role === "ADMIN" ? "Admin" : user.role === "SUPERVISOR" ? "Supervisor" : "Usuário"}
              </Badge>

              <Badge variant={user.active ? "default" : "destructive"} className={user.active ? "bg-green-600" : ""}>
                {user.active ? "Ativo" : "Bloqueado"}
              </Badge>
            </div>

            <Button
              variant={user.active ? "outline" : "destructive"}
              size="sm"
              className="w-full"
              onClick={() => toggleUserBlock(user.id, user.active)}
              disabled={processingUsers[user.id]}
            >
              {processingUsers[user.id] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : user.active ? (
                <>
                  <Check className="mr-1 h-4 w-4" /> Bloquear
                </>
              ) : (
                <>
                  <Ban className="mr-1 h-4 w-4" /> Desbloquear
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </AdminTableLayout>
  )
}

export default AdminUserTable
