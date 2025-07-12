export async function toggleBlockStatus(userId: string, isActive: boolean) {
  // aqui chama sua API
  return { success: true };
}

export async function updateUserRole(
  userId: string,
  role: "ADMIN" | "SUPERVISOR",
  shouldHaveRole: boolean
) {
  // aqui chama sua API
  return { success: true };
}
