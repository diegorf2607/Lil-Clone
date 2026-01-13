"use client"

import { useState, useEffect, useCallback } from "react"
import type { CRMData, Customer, Staff, Appointment } from "@/lib/types/crm"

const STORAGE_KEY = "beauty_crm_v1"

const defaultData: CRMData = {
  customers: [],
  staff: [],
  appointments: [],
}

export function useLocalStorageStore() {
  const [data, setData] = useState<CRMData>(defaultData)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setData(parsed)
      } else {
        setData(defaultData)
      }
    } catch (error) {
      console.error("Error loading CRM data from localStorage:", error)
      setData(defaultData)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (error) {
        console.error("Error saving CRM data to localStorage:", error)
      }
    }
  }, [data, isLoaded])

  // Customer operations
  const upsertCustomer = useCallback((customer: Customer) => {
    setData((prev) => {
      const existingIndex = prev.customers.findIndex((c) => c.phone === customer.phone)
      if (existingIndex >= 0) {
        // Update existing customer
        const updated = [...prev.customers]
        updated[existingIndex] = { ...updated[existingIndex], ...customer }
        return { ...prev, customers: updated }
      } else {
        // Add new customer
        return {
          ...prev,
          customers: [...prev.customers, customer],
        }
      }
    })
  }, [])

  const getCustomerByPhone = useCallback(
    (phone: string): Customer | undefined => {
      return data.customers.find((c) => c.phone === phone)
    },
    [data.customers]
  )

  // Staff operations
  const upsertStaff = useCallback((staff: Staff) => {
    setData((prev) => {
      const existingIndex = prev.staff.findIndex((s) => s.id === staff.id)
      if (existingIndex >= 0) {
        const updated = [...prev.staff]
        updated[existingIndex] = staff
        return { ...prev, staff: updated }
      } else {
        return {
          ...prev,
          staff: [...prev.staff, staff],
        }
      }
    })
  }, [])

  const getStaffById = useCallback(
    (id: string): Staff | undefined => {
      return data.staff.find((s) => s.id === id)
    },
    [data.staff]
  )

  // Appointment operations
  const addAppointment = useCallback((appointment: Appointment) => {
    setData((prev) => ({
      ...prev,
      appointments: [...prev.appointments, appointment],
    }))
  }, [])

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
