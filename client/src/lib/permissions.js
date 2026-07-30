export function useProjectPermissions(role) {
  return {
    isAdmin: role === "admin",
    canManageTasks: role === "admin" || role === "project_admin",
    canManageNotes: role === "admin",
    canManageMembers: role === "admin",
  };
}
