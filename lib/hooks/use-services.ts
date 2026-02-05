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
  const [lastError, setLastError] = useState<string | null>(null)
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
    async (servicesToSave: Service[]): Promise<{ success: boolean; error?: string }> => {
      setLastError(null)
      
      try {
        if (!useSupabase) {
          const errorMsg = "Supabase no configurado. No se pueden guardar servicios."
          console.error(errorMsg)
          setLastError(errorMsg)
          return { success: false, error: errorMsg }
        }

        console.log("Guardando servicios...", servicesToSave.length)
        
        // Save each service to Supabase
        const supabase = createClient()
        
        // First, get all existing services from Supabase
        const { data: existingServices, error: fetchError } = await supabase
          .from("services")
          .select("id, name")

        if (fetchError) {
          const errorMsg = `Error al obtener servicios existentes: ${fetchError.message}`
          console.error(errorMsg)
          setLastError(errorMsg)
          return { success: false, error: errorMsg }
        }

        const existingServicesMap = new Map((existingServices || []).map((s: any) => [s.name, s.id]))
        const existingIdsSet = new Set((existingServices || []).map((s: any) => s.id))

        let hasErrors = false
        let lastErrorMsg = ""

        // Process each service
        for (const service of servicesToSave) {
          const serviceId = service.id.toString()
          // Check if service exists by UUID first, then by name
          const existsByUUID = existingIdsSet.has(serviceId)
          const existingServiceIdByName = existingServicesMap.get(service.name)
          const isExisting = existsByUUID || existingServiceIdByName

          try {
            if (isExisting) {
              // Update existing service
              const idToUpdate = existsByUUID ? serviceId : existingServiceIdByName
              console.log(`Actualizando servicio: ${service.name} (${idToUpdate})`)
              
              const updated = await updateService(idToUpdate!, {
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
              
              if (!updated) {
                hasErrors = true
                lastErrorMsg = `Error al actualizar servicio: ${service.name}`
              }
            } else {
              // Create new service (don't pass id, let Supabase generate UUID)
              console.log(`Creando nuevo servicio: ${service.name}`)
              
              const result = await createService({
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
              
              if (result.error) {
                hasErrors = true
                lastErrorMsg = `Error al crear servicio "${service.name}": ${result.error}`
                console.error(lastErrorMsg)
              } else if (result.data) {
                console.log(`Servicio creado: ${service.name} -> ${result.data.id}`)
                // Update the service ID in the local array with the UUID from Supabase
                const index = servicesToSave.findIndex(s => s.name === service.name)
                if (index >= 0) {
                  servicesToSave[index].id = result.data.id
                }
              }
            }
          } catch (serviceError: any) {
            hasErrors = true
            lastErrorMsg = `Error guardando servicio ${service.name}: ${serviceError.message}`
            console.error(lastErrorMsg, serviceError)
          }
        }

        // Reload services from Supabase to get updated IDs
        const reloadedServices = await getServices()
        if (reloadedServices.length > 0) {
          setServices(reloadedServices)
        } else {
          setServices(servicesToSave)
        }

        if (hasErrors) {
          setLastError(lastErrorMsg)
          return { success: false, error: lastErrorMsg }
        }

        console.log("Servicios guardados exitosamente")
        return { success: true }
        
      } catch (error: any) {
        const errorMsg = `Error guardando servicios: ${error.message}`
        console.error(errorMsg, error)
        setLastError(errorMsg)
        return { success: false, error: errorMsg }
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
    lastError,
  }
}
