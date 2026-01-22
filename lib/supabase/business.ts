"use client"

import { createClient } from "@/lib/supabase/client"

export interface BusinessInfo {
  id?: string
  name?: string
  phone?: string
  email?: string
  address?: string
  logo?: string
  brandColor?: string
  publicLink?: string
  businessHours?: { [key: string]: { start: string; end: string; enabled: boolean } }
  googleCalendarConnected?: boolean
  googleCalendarToken?: string
  qrCode?: string
}

export async function getBusinessInfo(): Promise<BusinessInfo | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("business_info").select("*").limit(1).single()

  if (error) {
    // If no record exists, return default
    if (error.code === "PGRST116") {
      return null
    }
    console.error("Error fetching business info:", error)
    return null
  }

  return {
    id: data.id,
    name: data.name || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    address: data.address || undefined,
    logo: data.logo || undefined,
    brandColor: data.brand_color || undefined,
    publicLink: data.public_link || undefined,
    businessHours: (data.business_hours as any) || undefined,
    googleCalendarConnected: data.google_calendar_connected || false,
    googleCalendarToken: data.google_calendar_token || undefined,
    qrCode: data.qr_code || undefined,
  }
}

export async function upsertBusinessInfo(info: BusinessInfo): Promise<boolean> {
  const supabase = createClient()

  // Check if record exists
  const { data: existing } = await supabase.from("business_info").select("id").limit(1).single()

  const dataToInsert = {
    name: info.name || null,
    phone: info.phone || null,
    email: info.email || null,
    address: info.address || null,
    logo: info.logo || null,
    brand_color: info.brandColor || null,
    public_link: info.publicLink || null,
    business_hours: info.businessHours || null,
    google_calendar_connected: info.googleCalendarConnected || false,
    google_calendar_token: info.googleCalendarToken || null,
    qr_code: info.qrCode || null,
  }

  if (existing) {
    // Update existing
    const { error } = await supabase.from("business_info").update(dataToInsert).eq("id", existing.id)
    if (error) {
      console.error("Error updating business info:", error)
      return false
    }
  } else {
    // Insert new
    const { error } = await supabase.from("business_info").insert(dataToInsert)
    if (error) {
      console.error("Error creating business info:", error)
      return false
    }
  }

  return true
}
