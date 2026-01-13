"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push(redirectTo)
      } else if (!allowedRoles.includes(user.role)) {
        // Authenticated but wrong role, redirect to their dashboard
        switch (user.role) {
          case "dueno":
            router.push("/dashboard/dueno")
            break
          case "administrador":
            router.push("/dashboard/admin")
            break
          case "recepcionista":
            router.push("/dashboard/recepcion")
            break
          case "staff":
            router.push("/dashboard/staff")
            break
          default:
            router.push("/login")
        }
      }
    }
  }, [user, isLoading, allowedRoles, redirectTo, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#DFDBF1]/20 to-[#AFA1FD]/10">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#AFA1FD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2C293F]/60">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or wrong role
  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  // User is authenticated and has correct role
  return <>{children}</>
}
