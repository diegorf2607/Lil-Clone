// Types for CRM localStorage structure
export interface Customer {
  id: string
  fullName: string
  phone: string
  email?: string
  birthdate?: string // YYYY-MM-DD format
}

export interface Staff {
  id: string
  name: string
  extraMinutes: number // 0-60
}

export interface InspirationImage {
  name: string
  dataUrl: string // base64 data URL
}

export interface Appointment {
  id: string
  customerId: string
  staffId?: string // Optional - can be undefined/null for unassigned appointments
  serviceName: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  baseDuration: number // minutes
  inspirationImages: InspirationImage[]
  notes?: string
}

export interface CRMData {
  customers: Customer[]
  staff: Staff[]
  appointments: Appointment[]
}
