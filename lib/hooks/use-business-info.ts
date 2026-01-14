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
          // Fallback to localStorage
          const saved = localStorage.getItem("lilaBusinessInfo")
          if (saved) {
            setBusinessInfo(JSON.parse(saved))
          }
        }
      } catch (error) {
        console.error("Error loading business info:", error)
        // Fallback to localStorage
        try {
          const saved = localStorage.getItem("lilaBusinessInfo")
          if (saved) {
            setBusinessInfo(JSON.parse(saved))
          }
        } catch (e) {
          console.error("Error loading from localStorage:", e)
        }
      } finally {
        setIsLoaded(true)
      }
    }

    loadBusinessInfo()
  }, [useSupabase])

  const saveBusinessInfo = useCallback(
    async (info: BusinessInfo) => {
      try {
        if (useSupabase) {
          const success = await upsertBusinessInfo(info)
          if (success) {
            setBusinessInfo(info)
            // Also save to localStorage as backup
            localStorage.setItem("lilaBusinessInfo", JSON.stringify(info))
          }
        } else {
          localStorage.setItem("lilaBusinessInfo", JSON.stringify(info))
          setBusinessInfo(info)
        }
      } catch (error) {
        console.error("Error saving business info:", error)
        // Fallback to localStorage
        localStorage.setItem("lilaBusinessInfo", JSON.stringify(info))
        setBusinessInfo(info)
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
