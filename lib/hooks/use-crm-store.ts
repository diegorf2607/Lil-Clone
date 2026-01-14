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

  // Function to reload data from Supabase or localStorage
  const reloadData = useCallback(async () => {
      try {
        if (useSupabase) {
          const supabase = createClient()

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

          setData({
            customers: (customersData || []).map((c) => ({
              id: c.id,
              fullName: c.full_name,
              phone: c.phone,
              email: c.email || undefined,
              birthdate: c.birthdate || undefined,
            })),
            staff: (staffData || []).map((s) => ({
              id: s.id,
              name: s.name,
              extraMinutes: s.extra_minutes || 0,
            })),
            appointments: (appointmentsData || []).map((a) => ({
              id: a.id,
              customerId: a.customer_id,
              staffId: a.staff_id,
              serviceName: a.service_name,
              date: a.date,
              startTime: a.start_time,
              baseDuration: a.base_duration,
              inspirationImages: (a.inspiration_images as any) || [],
              notes: a.notes || undefined,
            })),
          })
        } else {
          // Fallback to localStorage
          const stored = localStorage.getItem("beauty_crm_v1")
          if (stored) {
            const parsed = JSON.parse(stored)
            setData(parsed)
          }
        }
      } catch (error) {
        console.error("Error loading CRM data:", error)
        // Fallback to localStorage on error
        try {
          const stored = localStorage.getItem("beauty_crm_v1")
          if (stored) {
            const parsed = JSON.parse(stored)
            setData(parsed)
          }
        } catch (e) {
          console.error("Error loading from localStorage:", e)
        }
      } finally {
        setIsLoaded(true)
      }
    }

    reloadData()
  }, [useSupabase, reloadTrigger, reloadData])

  // Expose reload function
  const reload = useCallback(() => {
    setReloadTrigger((prev) => prev + 1)
  }, [])

  // Customer operations
  const upsertCustomer = useCallback(
    async (customer: Customer) => {
      try {
        if (useSupabase) {
          const supabase = createClient()
          const { data: existingCustomer } = await supabase
            .from("customers")
            .select("id")
            .eq("phone", customer.phone)
            .single()

          if (existingCustomer) {
            await supabase
              .from("customers")
              .update({
                full_name: customer.fullName,
                email: customer.email || null,
                birthdate: customer.birthdate || null,
              })
              .eq("id", existingCustomer.id)
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

          // Reload from Supabase
          const { data: customersData } = await supabase
            .from("customers")
            .select("*")
            .order("created_at", { ascending: false })

          if (customersData) {
            setData((prev) => ({
              ...prev,
              customers: customersData.map((c) => ({
                id: c.id,
                fullName: c.full_name,
                phone: c.phone,
                email: c.email || undefined,
                birthdate: c.birthdate || undefined,
              })),
            }))
          }
        } else {
          // Fallback to localStorage
          setData((prev) => {
            const existingIndex = prev.customers.findIndex((c) => c.phone === customer.phone)
            let updatedCustomers
            if (existingIndex >= 0) {
              updatedCustomers = [...prev.customers]
              updatedCustomers[existingIndex] = { ...updatedCustomers[existingIndex], ...customer }
            } else {
              updatedCustomers = [...prev.customers, customer]
            }
            const newData = { ...prev, customers: updatedCustomers }
            localStorage.setItem("beauty_crm_v1", JSON.stringify(newData))
            return newData
          })
        }
      } catch (error) {
        console.error("Error upserting customer:", error)
        // Fallback to localStorage on error
        setData((prev) => {
          const existingIndex = prev.customers.findIndex((c) => c.phone === customer.phone)
          let updatedCustomers
          if (existingIndex >= 0) {
            updatedCustomers = [...prev.customers]
            updatedCustomers[existingIndex] = { ...updatedCustomers[existingIndex], ...customer }
          } else {
            updatedCustomers = [...prev.customers, customer]
          }
          const newData = { ...prev, customers: updatedCustomers }
          localStorage.setItem("beauty_crm_v1", JSON.stringify(newData))
          return newData
        })
      }
    },
    [useSupabase]
  )

  const getCustomerByPhone = useCallback(
    (phone: string): Customer | undefined => {
      return data.customers.find((c) => c.phone === phone)
    },
    [data.customers]
  )

  // Staff operations
  const upsertStaff = useCallback(
    async (staff: Staff) => {
      try {
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
        } else {
          // Fallback to localStorage
          setData((prev) => {
            const existingIndex = prev.staff.findIndex((s) => s.id === staff.id)
            let updatedStaff
            if (existingIndex >= 0) {
              updatedStaff = [...prev.staff]
              updatedStaff[existingIndex] = staff
            } else {
              updatedStaff = [...prev.staff, staff]
            }
            const newData = { ...prev, staff: updatedStaff }
            localStorage.setItem("beauty_crm_v1", JSON.stringify(newData))
            return newData
          })
        }
      } catch (error) {
        console.error("Error upserting staff:", error)
        // Fallback to localStorage
        setData((prev) => {
          const existingIndex = prev.staff.findIndex((s) => s.id === staff.id)
          let updatedStaff
          if (existingIndex >= 0) {
            updatedStaff = [...prev.staff]
            updatedStaff[existingIndex] = staff
          } else {
            updatedStaff = [...prev.staff, staff]
          }
          const newData = { ...prev, staff: updatedStaff }
          localStorage.setItem("beauty_crm_v1", JSON.stringify(newData))
          return newData
        })
      }
    },
    [useSupabase]
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

          // Reload all data from Supabase to ensure consistency
          const { data: customersData } = await supabase
            .from("customers")
            .select("*")
            .order("created_at", { ascending: false })

          const { data: staffData } = await supabase
            .from("staff")
            .select("*")
            .order("created_at", { ascending: false })

          const { data: appointmentsData } = await supabase
            .from("appointments")
            .select("*")
            .order("date", { ascending: false })

          if (customersData && staffData && appointmentsData) {
            setData({
              customers: customersData.map((c) => ({
                id: c.id,
                fullName: c.full_name,
                phone: c.phone,
                email: c.email || undefined,
                birthdate: c.birthdate || undefined,
              })),
              staff: staffData.map((s) => ({
                id: s.id,
                name: s.name,
                extraMinutes: s.extra_minutes || 0,
              })),
              appointments: appointmentsData.map((a) => ({
                id: a.id,
                customerId: a.customer_id,
                staffId: a.staff_id,
                serviceName: a.service_name,
                date: a.date,
                startTime: a.start_time,
                baseDuration: a.base_duration,
                inspirationImages: (a.inspiration_images as any) || [],
                notes: a.notes || undefined,
              })),
            })
          }
        } else {
          // Fallback to localStorage
          setData((prev) => {
            const newData = {
              ...prev,
              appointments: [...prev.appointments, appointment],
            }
            localStorage.setItem("beauty_crm_v1", JSON.stringify(newData))
            return newData
          })
        }
      } catch (error) {
        console.error("Error adding appointment:", error)
        // Fallback to localStorage
        setData((prev) => {
          const newData = {
            ...prev,
            appointments: [...prev.appointments, appointment],
          }
          localStorage.setItem("beauty_crm_v1", JSON.stringify(newData))
          return newData
        })
      }
    },
    [useSupabase]
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

  return {
    data,
    isLoaded,
    // Customers
    upsertCustomer,
    getCustomerByPhone,
    // Staff
    upsertStaff,
    getStaffById,
    // Appointments
    addAppointment,
    getAppointmentsByDate,
    getAppointmentsByCustomer,
    // Reload
    reload,
  }
}
