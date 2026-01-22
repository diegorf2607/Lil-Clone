"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export type UserRole = "dueno" | "administrador" | "recepcionista" | "staff"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  locationId?: string
  locations?: string[]
  phone?: string
  isActive?: boolean
}

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  isSupabaseAuth: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, name: string, role: UserRole, locationId?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/** Usuarios demo cuando Supabase no está configurado */
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "dueno@lila.com": {
    password: "demo123",
    user: { id: "1", email: "dueno@lila.com", name: "María González", role: "dueno", locations: ["loc1", "loc2", "loc3"] },
  },
  "admin@lila.com": {
    password: "demo123",
    user: { id: "2", email: "admin@lila.com", name: "Carlos Ramírez", role: "administrador", locationId: "loc1" },
  },
  "recepcion@lila.com": {
    password: "demo123",
    user: { id: "3", email: "recepcion@lila.com", name: "Ana Martínez", role: "recepcionista", locationId: "loc1" },
  },
  "staff@lila.com": {
    password: "demo123",
    user: { id: "4", email: "staff@lila.com", name: "Luis Torres", role: "staff", locationId: "loc1" },
  },
}

function isSupabaseConfigured(): boolean {
  if (typeof window === "undefined") return false
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && url !== "https://placeholder.supabase.co")
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const [isSupabaseAuth, setIsSupabaseAuth] = useState(false)

  // Load user session on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const useSupabase = isSupabaseConfigured()

        if (!useSupabase) {
          // Modo demo: cargar usuario desde localStorage
          setIsSupabaseAuth(false)
          const stored = typeof window !== "undefined" ? localStorage.getItem("lila_user") : null
          if (stored) {
            try {
              setUser(JSON.parse(stored))
            } catch {
              localStorage.removeItem("lila_user")
            }
          }
          setIsLoading(false)
          return
        }

        setIsSupabaseAuth(true)
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error loading session:", error)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          setSupabaseUser(session.user)
          await loadUserProfile(session.user.id)
        }
      } catch (error) {
        console.error("Error loading session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()

    if (!isSupabaseConfigured()) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setSupabaseUser(session.user)
        await loadUserProfile(session.user.id)
      } else if (event === "SIGNED_OUT") {
        setSupabaseUser(null)
        setUser(null)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setSupabaseUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error loading user profile:", error)
        return
      }

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role as UserRole,
          locationId: profile.location_id || undefined,
          locations: profile.locations || undefined,
          phone: profile.phone || undefined,
          isActive: profile.is_active,
        })
      }
    } catch (error) {
      console.error("Error in loadUserProfile:", error)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!isSupabaseConfigured()) {
        // Modo demo: usuarios mock
        const mock = MOCK_USERS[email.toLowerCase().trim()]
        if (!mock || mock.password !== password) {
          return { success: false, error: "Credenciales incorrectas. Usa dueno@lila.com, admin@lila.com, recepcion@lila.com o staff@lila.com con contraseña demo123." }
        }
        setUser(mock.user)
        if (typeof window !== "undefined") localStorage.setItem("lila_user", JSON.stringify(mock.user))
        switch (mock.user.role) {
          case "dueno": router.push("/dashboard/dueno"); break
          case "administrador": router.push("/dashboard/admin"); break
          case "recepcionista": router.push("/dashboard/recepcion"); break
          case "staff": router.push("/dashboard/staff"); break
          default: router.push("/dashboard")
        }
        return { success: true }
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { success: false, error: error.message }

      if (data.user) {
        setSupabaseUser(data.user)
        await loadUserProfile(data.user.id)
        const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", data.user.id).single()
        if (profile) {
          switch (profile.role) {
            case "dueno": router.push("/dashboard/dueno"); break
            case "administrador": router.push("/dashboard/admin"); break
            case "recepcionista": router.push("/dashboard/recepcion"); break
            case "staff": router.push("/dashboard/staff"); break
            default: router.push("/dashboard")
          }
        }
      }
      return { success: true }
    } catch (error: any) {
      console.error("Login error:", error)
      return { success: false, error: error.message || "Error al iniciar sesión" }
    }
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    locationId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Configura Supabase para registrar nuevos usuarios. Usa el modo demo (dueno@lila.com / demo123) mientras tanto." }
    }
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      })
      if (authError) return { success: false, error: authError.message }
      if (authData.user) {
        await supabase.from("user_profiles").update({ name, role, location_id: locationId || null }).eq("id", authData.user.id)
        setSupabaseUser(authData.user)
        await loadUserProfile(authData.user.id)
      }
      return { success: true }
    } catch (error: any) {
      console.error("Signup error:", error)
      return { success: false, error: error.message || "Error al crear cuenta" }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      if (isSupabaseConfigured()) await supabase.auth.signOut()
      setUser(null)
      setSupabaseUser(null)
      if (typeof window !== "undefined") localStorage.removeItem("lila_user")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Configura Supabase para recuperar contraseña. Usa el modo demo (dueno@lila.com / demo123) mientras tanto." }
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Error al enviar email de recuperación" }
    }
  }

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) return { success: false, error: "Configura Supabase para cambiar contraseña." }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Error al actualizar contraseña" }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        isSupabaseAuth,
        login,
        signup,
        logout,
        resetPassword,
        updatePassword,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
