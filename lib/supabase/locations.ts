"use client"

import { createClient } from "@/lib/supabase/client"

export interface Location {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  staffCount: number
  isActive: boolean
  createdAt: string
}

export async function getLocations(): Promise<Location[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("locations").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching locations:", error)
    return []
  }

  return (data || []).map((l) => ({
    id: l.id,
    name: l.name,
    address: l.address || undefined,
    phone: l.phone || undefined,
    email: l.email || undefined,
    staffCount: l.staff_count || 0,
    isActive: l.is_active,
    createdAt: l.created_at,
  }))
}

export async function createLocation(location: Omit<Location, "id" | "createdAt">): Promise<Location | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("locations")
    .insert({
      name: location.name,
      address: location.address || null,
      phone: location.phone || null,
      email: location.email || null,
      staff_count: location.staffCount,
      is_active: location.isActive,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating location:", error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    address: data.address || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    staffCount: data.staff_count || 0,
    isActive: data.is_active,
    createdAt: data.created_at,
  }
}

export async function updateLocation(id: string, location: Partial<Location>): Promise<boolean> {
  const supabase = createClient()
  const updateData: any = {}

  if (location.name !== undefined) updateData.name = location.name
  if (location.address !== undefined) updateData.address = location.address || null
  if (location.phone !== undefined) updateData.phone = location.phone || null
  if (location.email !== undefined) updateData.email = location.email || null
  if (location.staffCount !== undefined) updateData.staff_count = location.staffCount
  if (location.isActive !== undefined) updateData.is_active = location.isActive

  const { error } = await supabase.from("locations").update(updateData).eq("id", id)

  if (error) {
    console.error("Error updating location:", error)
    return false
  }

  return true
}

export async function deleteLocation(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("locations").delete().eq("id", id)

  if (error) {
    console.error("Error deleting location:", error)
    return false
  }

  return true
}
