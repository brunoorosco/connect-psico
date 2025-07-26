"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useUserPagination } from "@/hooks/useUserPagination"
import { AdminTableLayout } from "./AdminTableLayout"
import { promoveUserToSupervisor, unpromoteSupervisortoUser } from "@/actions/admin"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "sonner"
import { User } from "@/domain/model/user"

const ROLES = [
  { value: "DEFAULT", label: "Usuário" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "ADMIN", label: "Administrador" },
]
type UserRole = Omit<User, "id"> & { id: string }

const AdminRoleManagement = () => {
  const { users, search, setSearch, page, setPage, totalPages, loading, limit, setLimit } = useUserPagination()

  const [processingUsers, setProcessingUsers] = useState<Record<string, boolean>>({})
  const [confirmModal, setConfirmModal] = useState<{ user: UserRole; role: string } | null>(null)

  const handleConfirmChange = (user: UserRole, newRole: string) => {
    setConfirmModal({ user, role: newRole })
  }

  const handleApplyChange = async () => {
    if (!confirmModal) return

    const { user, role } = confirmModal
    setProcessingUsers((prev) => ({ ...prev }))

    try {
      if (role === "SUPERVISOR") {
        await promoveUserToSupervisor(user.id)
      } else if (role === "DEFAULT") {
        await unpromoteSupervisortoUser(user.id)
      } else {
        // ADMIN ou outro: implemente aqui se necessário
      }

      toast.success("Permissão atualizada", {
        description: `Permissão alterada para ${user.name.split(" ")[0]}.`,
      })
    } catch (err) {
      toast.error("Erro", {
        description: "Erro ao atualizar a permissão.",
      })
    } finally {
      setProcessingUsers((prev) => ({ ...prev }))
      setConfirmModal(null)
    }
  }

  return (
    <>
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
        {/* Desktop Layout */}
        <div className="hidden sm:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Permissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={user.role}
                      onValueChange={(value) => handleConfirmChange(user, value)}
                      disabled={processingUsers[user.id]}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden space-y-4">
          {users.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 shadow-sm bg-white dark:bg-zinc-900 space-y-2">
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>

              <div>
                <Select
                  defaultValue={user.role}
                  onValueChange={(value) => handleConfirmChange(user.id, value)}
                  disabled={processingUsers[user.id]}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </AdminTableLayout>

      {/* Modal de confirmação */}
      <Dialog open={!!confirmModal} onOpenChange={(open) => !open && setConfirmModal(null)}>
        <DialogContent aria-describedby={"update role"}>
          <DialogHeader>
            <DialogTitle>Confirmar alteração</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            {`Tem certeza que deseja alterar a permissão do ${confirmModal?.user.name.split(" ")[0]} para `}
            <strong>{ROLES.find((r) => r.value === confirmModal?.role)?.label}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModal(null)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyChange} disabled={!!processingUsers[String(confirmModal?.user.id)]}>
              {processingUsers[String(confirmModal?.user.id)] ? "Atualizando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AdminRoleManagement
