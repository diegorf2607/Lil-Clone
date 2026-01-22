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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, name: string, role: UserRole, locationId?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Load user session on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if Supabase is configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "https://placeholder.supabase.co") {
          // Supabase not configured, skip auth
          setIsLoading(false)
          return
        }

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

    // Listen for auth changes
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

    return () => {
      subscription.unsubscribe()
    }
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
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "https://placeholder.supabase.co") {
        return { success: false, error: "Supabase no está configurado. Por favor configura las variables de entorno." }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        setSupabaseUser(data.user)
        await loadUserProfile(data.user.id)

        // Redirect based on role
        if (data.user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("id", data.user.id)
            .single()

          if (profile) {
            switch (profile.role) {
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
                router.push("/dashboard")
            }
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
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      if (authData.user) {
        // Update profile with role and location
        const { error: profileError } = await supabase
          .from("user_profiles")
          .update({
            name,
            role,
            location_id: locationId || null,
          })
          .eq("id", authData.user.id)

        if (profileError) {
          console.error("Error updating profile:", profileError)
          // Don't fail signup if profile update fails, it will be created by trigger
        }

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
      await supabase.auth.signOut()
      setUser(null)
      setSupabaseUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Reset password error:", error)
      return { success: false, error: error.message || "Error al enviar email de recuperación" }
    }
  }

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Update password error:", error)
      return { success: false, error: error.message || "Error al actualizar contraseña" }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
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
