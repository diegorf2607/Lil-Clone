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
          setIsSupabaseAuth(false)
          setUser(null)
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
        return { success: false, error: "Supabase no configurado. Configura las variables en Vercel." }
      }

      console.log("Iniciando login...")
      
      // Timeout de 15 segundos para el login
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Tiempo de espera agotado. Verifica tu conexión.")), 15000)
      )
      
      const loginPromise = supabase.auth.signInWithPassword({ email, password })
      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as Awaited<typeof loginPromise>
      
      if (error) {
        console.error("Auth error:", error)
        return { success: false, error: error.message }
      }

      if (data.user) {
        console.log("Usuario autenticado, cargando perfil...")
        setSupabaseUser(data.user)
        
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()
        
        if (profileError) {
          console.error("Error loading profile:", profileError)
          // Si no existe el perfil, crear uno básico
          if (profileError.code === "PGRST116") {
            console.log("Perfil no existe, creando uno nuevo...")
            const { error: insertError } = await supabase.from("user_profiles").insert({
              id: data.user.id,
              email: data.user.email,
              name: data.user.email?.split("@")[0] || "Usuario",
              role: "staff",
              is_active: true
            })
            if (insertError) {
              console.error("Error creating profile:", insertError)
              return { success: false, error: "Error al crear perfil de usuario. Contacta al administrador." }
            }
            router.push("/dashboard/staff")
            return { success: true }
          }
          return { success: false, error: `Error al cargar perfil: ${profileError.message}` }
        }
        
        // Cargar perfil completo en background
        loadUserProfile(data.user.id)
        
        console.log("Perfil cargado, rol:", profile?.role)
        
        if (profile) {
          switch (profile.role) {
            case "dueno": router.push("/dashboard/dueno"); break
            case "administrador": router.push("/dashboard/admin"); break
            case "recepcionista": router.push("/dashboard/recepcion"); break
            case "staff": router.push("/dashboard/staff"); break
            default: router.push("/dashboard")
          }
        } else {
          router.push("/dashboard")
        }
      }
      return { success: true }
    } catch (error: any) {
      console.error("Login error:", error)
      return { success: false, error: error.message || "Error al iniciar sesión. Intenta de nuevo." }
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
