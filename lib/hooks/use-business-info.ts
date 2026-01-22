"use client"

import { useState, useEffect, useCallback } from "react"
import { getBusinessInfo, upsertBusinessInfo } from "@/lib/supabase/business"
import type { BusinessInfo } from "@/lib/supabase/business"

const isSupabaseConfigured = () => {
  return !!(
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co"
  )
}

export function useBusinessInfo() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const useSupabase = isSupabaseConfigured()

  // Load business info
  useEffect(() => {
    const loadBusinessInfo = async () => {
      try {
        if (useSupabase) {
          const info = await getBusinessInfo()
          setBusinessInfo(info)
        } else {
          console.error("Supabase no configurado. No se cargará información del negocio.")
          setBusinessInfo(null)
        }
      } catch (error) {
        console.error("Error loading business info:", error)
        setBusinessInfo(null)
      } finally {
        setIsLoaded(true)
      }
    }

    loadBusinessInfo()
  }, [useSupabase])

  const saveBusinessInfo = useCallback(
    async (info: BusinessInfo): Promise<boolean> => {
      try {
        if (useSupabase) {
          const success = await upsertBusinessInfo(info)
          if (success) {
            setBusinessInfo(info)
          }
          return success
        }
        console.error("Supabase no configurado. No se puede guardar información del negocio.")
        return false
      } catch (error) {
        console.error("Error saving business info:", error)
        return false
      }
    },
    [useSupabase]
  )

  return {
    businessInfo,
    isLoaded,
    saveBusinessInfo,
  }
}
