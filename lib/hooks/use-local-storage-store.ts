"use client"

import { useState, useEffect, useCallback } from "react"
import type { CRMData, Customer, Staff, Appointment } from "@/lib/types/crm"

const STORAGE_KEY = "beauty_crm_v1"

// Sample data with inspiration images for demo purposes
const sampleData: CRMData = {
  customers: [
    {
      id: "customer-ana-garcia",
      fullName: "Ana García",
      phone: "+1 234 567 8900",
      email: "ana.garcia@example.com",
      birthdate: "1990-05-15",
    },
  ],
  staff: [
    {
      id: "staff-1",
      name: "María López",
      extraMinutes: 5,
    },
  ],
  appointments: [
    {
      id: "appt-ana-1",
      customerId: "customer-ana-garcia",
      staffId: "staff-1",
      serviceName: "Manicura Clásica",
      date: "2023-11-05",
      startTime: "10:00",
      baseDuration: 60,
      inspirationImages: [
        {
          name: "inspiracion-1.jpg",
          dataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0FGQTFGRCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VuIGRlIEluc3BpcmFjacOzbiAxPC90ZXh0Pjwvc3ZnPg==",
        },
        {
          name: "inspiracion-2.jpg",
          dataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzhCN0ZFOEIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBkZSBJbnNwaXJhY2nDs24gMjwvdGV4dD48L3N2Zz4=",
        },
      ],
      notes: "Cliente quiere diseño con flores",
    },
    // Add appointments for history items
    {
      id: "appt-ana-history-1",
      customerId: "customer-ana-garcia",
      staffId: "staff-1",
      serviceName: "Manicura Clásica",
      date: "2023-10-15",
      startTime: "10:00",
      baseDuration: 60,
      inspirationImages: [
        {
          name: "inspiracion-historia-1.jpg",
          dataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0ZGQ0NDQyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VuIEhpc3RvcmlhbCAxPC90ZXh0Pjwvc3ZnPg==",
        },
      ],
      notes: "Reserva completada anteriormente",
    },
    {
      id: "appt-ana-history-2",
      customerId: "customer-ana-garcia",
      staffId: "staff-1",
      serviceName: "Pedicura Deluxe",
      date: "2023-09-20",
      startTime: "14:00",
      baseDuration: 45,
      inspirationImages: [
        {
          name: "inspiracion-historia-2.jpg",
          dataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0NDRkZGRiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VuIEhpc3RvcmlhbCAyPC90ZXh0Pjwvc3ZnPg==",
        },
        {
          name: "inspiracion-historia-3.jpg",
          dataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0ZGRkNDQyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VuIEhpc3RvcmlhbCAzPC90ZXh0Pjwvc3ZnPg==",
        },
      ],
      notes: "Pedicura con diseño especial",
    },
  ],
}

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
        // Merge with sample data to ensure demo appointments exist
        const mergedData: CRMData = {
          customers: parsed.customers.length > 0 ? parsed.customers : sampleData.customers,
          staff: parsed.staff.length > 0 ? parsed.staff : sampleData.staff,
          appointments: [
            ...parsed.appointments,
            // Add sample appointments if they don't exist
            ...sampleData.appointments.filter(
              (sampleApt) => !parsed.appointments.some((apt: Appointment) => apt.id === sampleApt.id)
            ),
          ],
        }
        setData(mergedData)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData))
      } else {
        // Initialize with sample data for demo purposes
        setData(sampleData)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData))
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
