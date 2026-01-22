"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { getServices, createService, updateService, deleteService } from "@/lib/supabase/services"
import type { Service } from "@/lib/supabase/services"

const isSupabaseConfigured = () => {
  return !!(
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co"
  )
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const useSupabase = isSupabaseConfigured()
  const channelRef = useRef<any>(null)

  // Load services
  useEffect(() => {
    const loadServices = async () => {
      try {
        if (useSupabase) {
          const loadedServices = await getServices()
          setServices(loadedServices)
          
          // Set up real-time subscription for services table
          const supabase = createClient()
          if (channelRef.current) {
            await supabase.removeChannel(channelRef.current)
          }
          
          channelRef.current = supabase
            .channel("services-changes")
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "services",
              },
              async () => {
                // Reload services when there are changes
                const reloadedServices = await getServices()
                setServices(reloadedServices)
              }
            )
            .subscribe()
        } else {
          console.error("Supabase no configurado. No se cargarán servicios.")
          setServices([])
        }
      } catch (error) {
        console.error("Error loading services:", error)
        setServices([])
      } finally {
        setIsLoaded(true)
      }
    }

    loadServices()
    
    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current && useSupabase) {
        const supabase = createClient()
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [useSupabase])

  const saveServices = useCallback(
    async (servicesToSave: Service[]) => {
      try {
        if (useSupabase) {
          // Save each service to Supabase
          const supabase = createClient()
          
          // First, get all existing services from Supabase
          const { data: existingServices } = await supabase
            .from("services")
            .select("id, name")

          const existingServicesMap = new Map((existingServices || []).map((s: any) => [s.name, s.id]))

          // Process each service
          for (const service of servicesToSave) {
            const serviceId = service.id.toString()
            // Check if service exists by name (more reliable than ID since IDs might be numbers)
            const existingServiceId = existingServicesMap.get(service.name)
            const isExisting = existingServiceId || 
                              (existingServices || []).some((s: any) => s.id === serviceId || s.id.toString() === serviceId)

            try {
              if (isExisting && existingServiceId) {
                // Update existing service using the UUID from Supabase
                await updateService(existingServiceId, {
                  name: service.name,
                  description: service.description,
                  image: service.image,
                  duration: service.duration,
                  price: service.price,
                  showPublic: service.showPublic,
                  requiereAdelanto: service.requiereAdelanto,
                  montoAdelanto: service.montoAdelanto,
                  metodoPago: service.metodoPago,
                  esPack: service.esPack,
                  subservicios: service.subservicios,
                  locationIds: service.locationIds,
                  availableDays: service.availableDays,
                  customDays: service.customDays,
                })
              } else {
                // Create new service (don't pass id, let Supabase generate UUID)
                const created = await createService({
                  name: service.name,
                  description: service.description,
                  image: service.image,
                  duration: service.duration,
                  price: service.price,
                  showPublic: service.showPublic,
                  requiereAdelanto: service.requiereAdelanto,
                  montoAdelanto: service.montoAdelanto,
                  metodoPago: service.metodoPago,
                  esPack: service.esPack,
                  subservicios: service.subservicios,
                  locationIds: service.locationIds,
                  availableDays: service.availableDays,
                  customDays: service.customDays,
                })
                if (created) {
                  // Update the service ID in the local array with the UUID from Supabase
                  const index = servicesToSave.findIndex(s => s.name === service.name)
                  if (index >= 0) {
                    servicesToSave[index].id = created.id
                  }
                }
              }
            } catch (serviceError) {
              console.error(`Error saving service ${service.name}:`, serviceError)
              // Continue with next service
            }
          }

          // Reload services from Supabase to get updated IDs
          const reloadedServices = await getServices()
          if (reloadedServices.length > 0) {
            const mappedServices = reloadedServices.map((s) => ({
              id: s.id,
              name: s.name,
              description: s.description,
              image: s.image,
              duration: s.duration,
              price: s.price,
              showPublic: s.showPublic,
              requiereAdelanto: s.requiereAdelanto,
              montoAdelanto: s.montoAdelanto,
              metodoPago: s.metodoPago,
              esPack: s.esPack,
              subservicios: s.subservicios,
              locationIds: s.locationIds,
              availableDays: s.availableDays,
              customDays: s.customDays,
            }))
            setServices(mappedServices)
          } else {
            setServices(servicesToSave)
          }

        } else {
          console.error("Supabase no configurado. No se pueden guardar servicios.")
        }
      } catch (error) {
        console.error("Error saving services:", error)
      }
    },
    [useSupabase]
  )

  const reloadServices = useCallback(async () => {
    try {
      if (useSupabase) {
        const loadedServices = await getServices()
        setServices(loadedServices)
      } else {
        console.error("Supabase no configurado. No se pueden recargar servicios.")
      }
    } catch (error) {
      console.error("Error reloading services:", error)
    }
  }, [useSupabase])

  return {
    services,
    isLoaded,
    saveServices,
    reloadServices,
  }
}
