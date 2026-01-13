export type UserRole = "owner" | "admin" | "reception" | "staff"

export interface UserSession {
  id: string
  email: string
  role: UserRole
  name: string
  businessId?: string
  locationIds?: string[]
}

export const rolePermissions: Record<UserRole, string[]> = {
  owner: ["all"],
  admin: ["dashboard", "services", "calendar", "reservations", "config", "reports"],
  reception: ["dashboard", "calendar", "reservations", "clients"],
  staff: ["dashboard", "calendar", "my-reservations"],
}
