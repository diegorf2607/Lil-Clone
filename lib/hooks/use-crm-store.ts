"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Customer, Staff, Appointment } from "@/lib/types/crm"

interface CRMData {
  customers: Customer[]
  staff: Staff[]
  appointments: Appointment[]
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co"
  )
}

export function useCRMStore() {
  const [data, setData] = useState<CRMData>({
    customers: [],
    staff: [],
    appointments: [],
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const useSupabase = isSupabaseConfigured()

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        // Debug: Log Supabase configuration status
        console.log("🔍 Verificando Supabase:", {
          isConfigured: useSupabase,
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || "N/A"
        })

        if (useSupabase) {
          try {
            const supabase = createClient()
            console.log("✅ Cliente Supabase creado exitosamente")

          // Load customers
          const { data: customersData, error: customersError } = await supabase
            .from("customers")
            .select("*")
            .order("created_at", { ascending: false })

          // Load staff
          const { data: staffData, error: staffError } = await supabase
            .from("staff")
            .select("*")
            .order("created_at", { ascending: false })

          // Load appointments
          const { data: appointmentsData, error: appointmentsError } = await supabase
            .from("appointments")
            .select("*")
            .order("date", { ascending: false })

          if (customersError) console.error("Error loading customers:", customersError)
          if (staffError) console.error("Error loading staff:", staffError)
          if (appointmentsError) console.error("Error loading appointments:", appointmentsError)

          // Only update data if we have valid data, otherwise keep existing data
          const newCustomers = (customersData || []).map((c) => ({
            id: c.id,
            fullName: c.full_name,
            phone: c.phone,
            email: c.email || undefined,
            birthdate: c.birthdate || undefined,
          }))
          const newStaff = (staffData || []).map((s) => ({
            id: s.id,
            name: s.name,
            extraMinutes: s.extra_minutes || 0,
          }))
          const newAppointments = (appointmentsData || []).map((a) => ({
            id: a.id,
            customerId: a.customer_id,
            staffId: a.staff_id,
            serviceName: a.service_name,
            date: a.date,
            startTime: a.start_time,
            baseDuration: a.base_duration,
            inspirationImages: (a.inspiration_images as any) || [],
            notes: a.notes || undefined,
          }))

          setData({
            customers: newCustomers,
            staff: newStaff,
            appointments: newAppointments,
          })
          console.log("✅ Datos cargados desde Supabase:", {
            customers: newCustomers.length,
            staff: newStaff.length,
            appointments: newAppointments.length
          })
          } catch (supabaseError: any) {
            console.error("❌ Error al crear cliente Supabase:", supabaseError)
            throw supabaseError // Re-throw to be caught by outer try-catch
          }
        } else {
          console.error("Supabase no configurado. No se cargarán datos CRM.")
          setData({ customers: [], staff: [], appointments: [] })
        }
      } catch (error) {
        console.error("❌ Error loading CRM data:", error)
        setData({ customers: [], staff: [], appointments: [] })
      } finally {
        setIsLoaded(true)
      }
    }

    loadData()
  }, [useSupabase, reloadTrigger])

  // Expose reload function
  const reload = useCallback(() => {
    setReloadTrigger((prev) => prev + 1)
  }, [])

  // Customer operations
  const upsertCustomer = useCallback(
    async (customer: Customer) => {
      try {
        if (!useSupabase) {
          throw new Error("Supabase no configurado")
        }
        if (useSupabase) {
          const supabase = createClient()
          const { data: existingCustomer, error: findError } = await supabase
            .from("customers")
            .select("id")
            .eq("phone", customer.phone)
            .maybeSingle()

          if (findError) {
            console.error("Error finding customer:", findError)
            throw findError
          }

          if (existingCustomer) {
            // Only update email and birthdate if they're provided, don't overwrite existing full_name
            // This prevents changing the customer name when creating new appointments
            // Get current customer data first to check existing name
            const { data: currentCustomer } = await supabase
              .from("customers")
              .select("full_name, email, birthdate")
              .eq("id", existingCustomer.id)
              .single()
            
            const updateData: {
              email?: string | null
              birthdate?: string | null
              full_name?: string
            } = {}
            
            // Only update email if provided and different
            if (customer.email !== undefined && customer.email !== currentCustomer?.email) {
              updateData.email = customer.email || null
            }
            
            // Only update birthdate if provided and different
            if (customer.birthdate !== undefined && customer.birthdate !== currentCustomer?.birthdate) {
              updateData.birthdate = customer.birthdate || null
            }
            
            // Always update full_name if provided and different
            // This ensures that when creating reservations with different names for the same phone,
            // the customer name gets updated to match the reservation name
            // This is necessary because phone has UNIQUE constraint in Supabase
            if (customer.fullName && customer.fullName.trim()) {
              if (currentCustomer?.full_name?.trim().toLowerCase() !== customer.fullName.trim().toLowerCase()) {
                updateData.full_name = customer.fullName
              }
            }
            
            if (Object.keys(updateData).length > 0) {
              const { error: updateError } = await supabase
                .from("customers")
                .update(updateData)
                .eq("id", existingCustomer.id)

              if (updateError) {
                console.error("Error updating customer:", updateError)
                throw updateError
              }
            }
          } else {
            // Don't pass id - let Supabase generate UUID automatically
            const { data: insertedCustomer, error: insertError } = await supabase
              .from("customers")
              .insert({
                full_name: customer.fullName,
                phone: customer.phone,
                email: customer.email || null,
                birthdate: customer.birthdate || null,
              })
              .select()
              .single()

            if (insertError) {
              console.error("Error inserting customer:", insertError)
              throw insertError
            }

            // Update customer.id with the generated UUID from Supabase
            if (insertedCustomer) {
              customer.id = insertedCustomer.id
            }
          }

          // Trigger reload to refresh all data from Supabase
          // This ensures all data is in sync
          setReloadTrigger((prev) => prev + 1)
      } catch (error) {
        console.error("Error upserting customer:", error)
        throw error
      }
    },
    [useSupabase, setReloadTrigger]
  )

  const getCustomerByPhone = useCallback(
    (phone: string): Customer | undefined => {
      return data.customers.find((c) => c.phone === phone)
    },
    [data.customers]
  )

  const getOrCreateCustomerId = useCallback(
    async (customer: Customer): Promise<string | null> => {
      const normalizedPhone =
        customer.phone?.trim() || (customer.email ? `email:${customer.email}` : `temp:${Date.now()}`)
      const normalizedCustomer: Customer = {
        ...customer,
        phone: normalizedPhone,
        fullName: customer.fullName?.trim() ? customer.fullName : "Cliente",
      }

      try {
        if (!useSupabase) {
          throw new Error("Supabase no configurado")
        }
        if (useSupabase) {
          const supabase = createClient()
          const { data: upserted, error } = await supabase
            .from("customers")
            .upsert(
              {
                full_name: normalizedCustomer.fullName,
                phone: normalizedCustomer.phone,
                email: normalizedCustomer.email || null,
                birthdate: normalizedCustomer.birthdate || null,
              },
              { onConflict: "phone" }
            )
            .select("id")
            .single()

          if (error) {
            console.error("Error upserting customer for ID:", error)
            throw error
          }

          setReloadTrigger((prev) => prev + 1)
          return upserted?.id || null
        }
      } catch (error) {
        console.error("Error getting/creating customer ID:", error)
        return null
      }
    },
    [useSupabase, setReloadTrigger, data.customers, setData]
  )

  const deleteCustomer = useCallback(
    async (customerId: string) => {
      try {
        if (!useSupabase) {
          throw new Error("Supabase no configurado")
        }
        if (useSupabase) {
          const supabase = createClient()
          const { error } = await supabase
            .from("customers")
            .delete()
            .eq("id", customerId)

          if (error) {
            console.error("Error deleting customer:", error)
            throw error
          }

          // Trigger reload to refresh all data from Supabase
          setReloadTrigger((prev) => prev + 1)
      } catch (error) {
        console.error("Error deleting customer:", error)
        throw error
      }
    },
    [useSupabase, setReloadTrigger]
  )

  // Staff operations
  const upsertStaff = useCallback(
    async (staff: Staff) => {
      try {
        if (!useSupabase) {
          throw new Error("Supabase no configurado")
        }
        if (useSupabase) {
          const supabase = createClient()
          // Check if staff exists by name (more reliable than ID)
          const { data: existingStaff } = await supabase
            .from("staff")
            .select("id")
            .eq("name", staff.name)
            .maybeSingle()

          // Also check by ID if it's a valid UUID
          let existingStaffById = null
          if (staff.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(staff.id)) {
            const { data } = await supabase
              .from("staff")
              .select("id")
              .eq("id", staff.id)
              .maybeSingle()
            existingStaffById = data
          }

          const finalExistingStaff = existingStaffById || existingStaff

          if (finalExistingStaff) {
            await supabase
              .from("staff")
              .update({
                name: staff.name,
                extra_minutes: staff.extraMinutes,
              })
              .eq("id", finalExistingStaff.id)
          } else {
            // Don't pass id - let Supabase generate UUID automatically
            const { data: insertedStaff, error: insertError } = await supabase
              .from("staff")
              .insert({
                name: staff.name,
                extra_minutes: staff.extraMinutes,
              })
              .select()
              .single()

            if (insertError) {
              console.error("Error inserting staff:", insertError)
              throw insertError
            }

            // Update staff.id with the generated UUID from Supabase
            if (insertedStaff) {
              staff.id = insertedStaff.id
            }
          }

          // Reload from Supabase
          const { data: staffData } = await supabase
            .from("staff")
            .select("*")
            .order("created_at", { ascending: false })

          if (staffData) {
            setData((prev) => ({
              ...prev,
              staff: staffData.map((s) => ({
                id: s.id,
                name: s.name,
                extraMinutes: s.extra_minutes || 0,
              })),
            }))
          }
      } catch (error) {
        console.error("Error upserting staff:", error)
        throw error
      }
    },
    [useSupabase, setReloadTrigger]
  )

  const getStaffById = useCallback(
    (id: string): Staff | undefined => {
      return data.staff.find((s) => s.id === id)
    },
    [data.staff]
  )

  // Appointment operations
  const addAppointment = useCallback(
    async (appointment: Appointment) => {
      try {
        if (!useSupabase) {
          throw new Error("Supabase no configurado")
        }
        if (useSupabase) {
          const supabase = createClient()
          // Don't pass id - let Supabase generate UUID automatically
          const { data: insertedAppointment, error: insertError } = await supabase
            .from("appointments")
            .insert({
              customer_id: appointment.customerId,
              staff_id: (appointment.staffId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(appointment.staffId)) 
                ? appointment.staffId 
                : null,
              service_name: appointment.serviceName,
              date: appointment.date,
              start_time: appointment.startTime,
              base_duration: appointment.baseDuration,
              inspiration_images: appointment.inspirationImages,
              notes: appointment.notes || null,
            })
            .select()
            .single()

          if (insertError) {
            console.error("Error inserting appointment:", insertError)
            throw insertError
          }

          // Trigger reload to refresh all data from Supabase
          // This ensures all data is in sync and components are updated
          setReloadTrigger((prev) => prev + 1)
      } catch (error) {
        console.error("Error adding appointment:", error)
        throw error
      }
    },
    [useSupabase, setReloadTrigger]
  )

  const getAppointmentsByDate = useCallback(
    (date: string): Appointment[] => {
      return data.appointments.filter((apt) => apt.date === date)
    },
    [data.appointments]
  )

  const getAppointmentsByCustomer = useCallback(
    (customerId: string): Appointment[] => {
      return data.appointments.filter((apt) => apt.customerId === customerId)
    },
    [data.appointments]
  )

  const deleteAppointment = useCallback(
    async (appointmentId: string) => {
      try {
        if (!useSupabase) {
          throw new Error("Supabase no configurado")
        }
        if (useSupabase) {
          const supabase = createClient()
          const { error } = await supabase
            .from("appointments")
            .delete()
            .eq("id", appointmentId)

          if (error) {
            console.error("Error deleting appointment:", error)
            throw error
          }

          // Trigger reload to refresh all data from Supabase
          setReloadTrigger((prev) => prev + 1)
      } catch (error) {
        console.error("Error deleting appointment:", error)
        throw error
      }
    },
    [useSupabase, setReloadTrigger]
  )

  return {
    data,
    isLoaded,
    // Customers
    upsertCustomer,
    getCustomerByPhone,
    deleteCustomer,
    // Staff
    upsertStaff,
    getStaffById,
    // Appointments
    addAppointment,
    getAppointmentsByDate,
    getAppointmentsByCustomer,
    deleteAppointment,
    getOrCreateCustomerId,
    // Reload
    reload,
  }
}
