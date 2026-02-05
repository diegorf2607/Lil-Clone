"use client"

import { createClient } from "@/lib/supabase/client"

export interface Service {
  id: string
  name: string
  description?: string
  image?: string
  duration: number
  price: number
  showPublic: boolean
  requiereAdelanto: boolean
  montoAdelanto: number
  metodoPago: "online" | "transferencia" | "no-aplica"
  esPack: boolean
  subservicios?: any[]
  locationIds?: string[]
  availableDays?: { [key: string]: boolean }
  customDays: boolean
}

export async function getServices(): Promise<Service[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching services:", error)
    return []
  }

  return (data || []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description || undefined,
    image: s.image || undefined,
    duration: s.duration,
    price: parseFloat(s.price),
    showPublic: s.show_public,
    requiereAdelanto: s.requiere_adelanto,
    montoAdelanto: parseFloat(s.monto_adelanto || 0),
    metodoPago: s.metodo_pago,
    esPack: s.es_pack,
    subservicios: (s.subservicios as any) || undefined,
    locationIds: (s.location_ids as any) || undefined,
    availableDays: (s.available_days as any) || undefined,
    customDays: s.custom_days || false,
  }))
}

export async function createService(service: Omit<Service, "id">): Promise<{ data: Service | null; error: string | null }> {
  const supabase = createClient()
  
  console.log("Creando servicio:", service.name)
  
  const { data, error } = await supabase
    .from("services")
    .insert({
      name: service.name,
      description: service.description || null,
      image: service.image || null,
      duration: service.duration,
      price: service.price,
      show_public: service.showPublic,
      requiere_adelanto: service.requiereAdelanto,
      monto_adelanto: service.montoAdelanto,
      metodo_pago: service.metodoPago,
      es_pack: service.esPack,
      subservicios: service.subservicios || null,
      location_ids: service.locationIds || null,
      available_days: service.availableDays || null,
      custom_days: service.customDays || false,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating service:", error)
    return { data: null, error: error.message }
  }

  console.log("Servicio creado exitosamente:", data.id)

  return {
    data: {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      image: data.image || undefined,
      duration: data.duration,
      price: parseFloat(data.price),
      showPublic: data.show_public,
      requiereAdelanto: data.requiere_adelanto,
      montoAdelanto: parseFloat(data.monto_adelanto || 0),
      metodoPago: data.metodo_pago,
      esPack: data.es_pack,
      subservicios: (data.subservicios as any) || undefined,
      locationIds: (data.location_ids as any) || undefined,
      availableDays: (data.available_days as any) || undefined,
      customDays: data.custom_days || false,
    },
    error: null
  }
}

export async function updateService(id: string, service: Partial<Service>): Promise<boolean> {
  const supabase = createClient()
  const updateData: any = {}

  if (service.name !== undefined) updateData.name = service.name
  if (service.description !== undefined) updateData.description = service.description || null
  if (service.image !== undefined) updateData.image = service.image || null
  if (service.duration !== undefined) updateData.duration = service.duration
  if (service.price !== undefined) updateData.price = service.price
  if (service.showPublic !== undefined) updateData.show_public = service.showPublic
  if (service.requiereAdelanto !== undefined) updateData.requiere_adelanto = service.requiereAdelanto
  if (service.montoAdelanto !== undefined) updateData.monto_adelanto = service.montoAdelanto
  if (service.metodoPago !== undefined) updateData.metodo_pago = service.metodoPago
  if (service.esPack !== undefined) updateData.es_pack = service.esPack
  if (service.subservicios !== undefined) updateData.subservicios = service.subservicios || null
  if (service.locationIds !== undefined) updateData.location_ids = service.locationIds || null
  if (service.availableDays !== undefined) updateData.available_days = service.availableDays || null
  if (service.customDays !== undefined) updateData.custom_days = service.customDays

  const { error } = await supabase.from("services").update(updateData).eq("id", id)

  if (error) {
    console.error("Error updating service:", error)
    return false
  }

  return true
}

export async function deleteService(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("services").delete().eq("id", id)

  if (error) {
    console.error("Error deleting service:", error)
    return false
  }

  return true
}
