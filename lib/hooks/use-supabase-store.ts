"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Customer, Staff, Appointment } from "@/lib/types/crm"

interface CRMData {
  customers: Customer[]
  staff: Staff[]
  appointments: Appointment[]
}

export function useSupabaseStore() {
  const [data, setData] = useState<CRMData>({
    customers: [],
    staff: [],
    appointments: [],
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const supabase = createClient()

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
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
      } catch (error) {
        console.error("Error loading CRM data from Supabase:", error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadData()
  }, [supabase])

  // Customer operations
  const upsertCustomer = useCallback(
    async (customer: Customer) => {
      try {
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("phone", customer.phone)
          .single()

        if (existingCustomer) {
          // Update existing customer
          const { error } = await supabase
            .from("customers")
            .update({
              full_name: customer.fullName,
              email: customer.email || null,
              birthdate: customer.birthdate || null,
            })
            .eq("id", existingCustomer.id)

          if (error) throw error
        } else {
          // Insert new customer
          const { error } = await supabase.from("customers").insert({
            id: customer.id,
            full_name: customer.fullName,
            phone: customer.phone,
            email: customer.email || null,
            birthdate: customer.birthdate || null,
          })

          if (error) throw error
        }

        // Reload data
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
      } catch (error) {
        console.error("Error upserting customer:", error)
        throw error
      }
    },
    [supabase]
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
        const { data: existingStaff } = await supabase
          .from("staff")
          .select("id")
          .eq("id", staff.id)
          .single()

        if (existingStaff) {
          // Update existing staff
          const { error } = await supabase
            .from("staff")
            .update({
              name: staff.name,
              extra_minutes: staff.extraMinutes,
            })
            .eq("id", staff.id)

          if (error) throw error
        } else {
          // Insert new staff
          const { error } = await supabase.from("staff").insert({
            id: staff.id,
            name: staff.name,
            extra_minutes: staff.extraMinutes,
          })

          if (error) throw error
        }

        // Reload data
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
    [supabase]
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
        const { error } = await supabase.from("appointments").insert({
          id: appointment.id,
          customer_id: appointment.customerId,
          staff_id: appointment.staffId,
          service_name: appointment.serviceName,
          date: appointment.date,
          start_time: appointment.startTime,
          base_duration: appointment.baseDuration,
          inspiration_images: appointment.inspirationImages,
          notes: appointment.notes || null,
        })

        if (error) throw error

        // Reload data
        const { data: appointmentsData } = await supabase
          .from("appointments")
          .select("*")
          .order("date", { ascending: false })

        if (appointmentsData) {
          setData((prev) => ({
            ...prev,
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
          }))
        }
      } catch (error) {
        console.error("Error adding appointment:", error)
        throw error
      }
    },
    [supabase]
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
  }
}
