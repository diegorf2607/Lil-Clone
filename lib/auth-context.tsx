"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "dueno" | "administrador" | "recepcionista" | "staff"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  locationId?: string // For staff/recepcionista assigned to specific location
  locations?: string[] // For dueno with multiple locations
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo purposes
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "dueno@lila.com": {
    password: "demo123",
    user: {
      id: "1",
      email: "dueno@lila.com",
      name: "María González",
      role: "dueno",
      locations: ["loc1", "loc2", "loc3"],
    },
  },
  "admin@lila.com": {
    password: "demo123",
    user: {
      id: "2",
      email: "admin@lila.com",
      name: "Carlos Ramírez",
      role: "administrador",
      locationId: "loc1",
    },
  },
  "recepcion@lila.com": {
    password: "demo123",
    user: {
      id: "3",
      email: "recepcion@lila.com",
      name: "Ana Martínez",
      role: "recepcionista",
      locationId: "loc1",
    },
  },
  "staff@lila.com": {
    password: "demo123",
    user: {
      id: "4",
      email: "staff@lila.com",
      name: "Luis Torres",
      role: "staff",
      locationId: "loc1",
    },
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("lila_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("lila_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const mockUser = MOCK_USERS[email.toLowerCase()]

    if (mockUser && mockUser.password === password) {
      setUser(mockUser.user)
      localStorage.setItem("lila_user", JSON.stringify(mockUser.user))

      // Redirect based on role
      switch (mockUser.user.role) {
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
          router.push("/admin")
      }

      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("lila_user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
