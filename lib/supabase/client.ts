"use client"

import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client that will fail gracefully
    // This allows the app to work without Supabase configured (fallback mode)
    console.warn("Supabase not configured. Some features may not work.")
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "placeholder-key"
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
