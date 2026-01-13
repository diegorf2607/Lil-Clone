"use client"

import { useAuth } from "@/lib/auth-context"

export function usePermissions() {
  const { user } = useAuth()

  return {
    canEditServices: ["dueno", "administrador"].includes(user?.role || ""),
    canCreateReservations: ["dueno", "administrador", "recepcionista"].includes(user?.role || ""),
    canEditConfig: ["dueno", "administrador"].includes(user?.role || ""),
    canEditStaff: user?.role === "dueno",
    canEditBusinessHours: ["dueno", "administrador"].includes(user?.role || ""),
    canViewAllLocations: user?.role === "dueno",
    canViewAllReservations: user?.role !== "staff",
    canDeleteServices: ["dueno", "administrador"].includes(user?.role || ""),
    canDeleteReservations: ["dueno", "administrador", "recepcionista"].includes(user?.role || ""),
    isStaff: user?.role === "staff",
    isRecepcionista: user?.role === "recepcionista",
    isDueno: user?.role === "dueno",
    isAdministrador: user?.role === "administrador",
    userLocationId: user?.locationId,
    userLocations: user?.locations || [],
    userName: user?.name || "",
    userRole: user?.role,
  }
}
