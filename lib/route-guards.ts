import type { UserRole } from "./auth-context"

// Define route permissions
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "/dashboard/dueno": ["dueno"],
  "/dashboard/admin": ["administrador"],
  "/dashboard/recepcion": ["recepcionista"],
  "/dashboard/staff": ["staff"],
  "/admin": ["dueno", "administrador"],
  "/reservas": ["dueno", "administrador", "recepcionista"],
}

// Check if user has permission to access a route
export function canAccessRoute(userRole: UserRole, pathname: string): boolean {
  const allowedRoles = ROUTE_PERMISSIONS[pathname]

  if (!allowedRoles) {
    // Route not in permissions list, allow access (public route)
    return true
  }

  return allowedRoles.includes(userRole)
}

// Get redirect path based on user role
export function getDefaultDashboard(role: UserRole): string {
  switch (role) {
    case "dueno":
      return "/dashboard/dueno"
    case "administrador":
      return "/dashboard/admin"
    case "recepcionista":
      return "/dashboard/recepcion"
    case "staff":
      return "/dashboard/staff"
    default:
      return "/login"
  }
}
