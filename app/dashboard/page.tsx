"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react" // Added useEffect
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Scissors, Calendar, ClipboardList, Settings, LogOut, TrendingUp, Users, DollarSign, BarChart3, Plus, ChevronLeft, ChevronRight, Building2, LinkIcon, QrCode, Copy, Check, Upload, Sparkles, ArrowUpRight, Clock, UserPlus, CalendarClock, X, Lock, Package, Layers, User, ArrowRight, ImageIcon, Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Added
import Link from "next/link"
import { toast } from "@/components/ui/use-toast" // Added toast
import { useAuth } from "@/lib/auth-context"
import { usePermissions } from "@/lib/use-permissions"
import { useRouter, usePathname } from "next/navigation"
import { useMemo } from "react"
import { useCRMStore } from "@/lib/hooks/use-crm-store"
import { useServices } from "@/lib/hooks/use-services"
import { useBusinessInfo } from "@/lib/hooks/use-business-info"
import { CustomersList } from "@/components/customers-list"
import { DailyCalendarView } from "@/components/daily-calendar-view"
import { StaffExtraMinutesForm } from "@/components/staff-extra-minutes-form"

type AdminView = "dashboard" | "services" | "calendar" | "reservations" | "config" | "customers"

interface SubService {
  id: string
  nombre: string
  duracion: number
  personalId: number
  personalName: string
  precioParcial: number
  inicioDependiente: boolean
}

interface Service {
  id: number
  name: string
  description: string
  image?: string // Base64 encoded image or URL
  duration: number
  price: number
  showPublic: boolean
  requiereAdelanto: boolean
  montoAdelanto: number
  metodoPago: "online" | "transferencia" | "no-aplica"
  esPack: boolean
  subservicios?: SubService[]
  availableDays?: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
}

interface ServiceFormData {
  name: string
  description: string
  image: string
  duration: string
  price: string
  showPublic: boolean
  requiereAdelanto: boolean
  montoAdelanto: string
  metodoPago: "online" | "transferencia" | "no-aplica"
  esPack: boolean
  customDays: boolean
  availableDays: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
}

interface StaffMember {
  id: number
  name: string
  email: string
  color: string
  workingHours: {
    [key: string]: { start: string; end: string; enabled: boolean }
  }
  customDurations?: {
    [serviceId: number]: number // Maps service ID to custom duration in minutes
  }
}

interface BusinessHours {
  [key: string]: { start: string; end: string; enabled: boolean }
}

interface CalendarOccupation {
  id: number
  day: number
  time: string
  title: string
  duration: number
  staffMember?: string
  notes?: string
}

interface CalendarAppointment {
  id: string
  day: number
  time: string
  client: string
  clientEmail: string
  clientPhone: string
  service: string
  staffMember: string
  notes?: string
  status: "confirmed" | "pending" | "completed" | "cancelled"
  isManual: boolean
  adelantoPagado?: boolean
  montoPagado?: number
  metodoPago?: string
  isPack?: boolean
  packId?: string
  packName?: string
  subServiceIndex?: number
  totalSubServices?: number
  paymentStatus?: "paid" | "pending" | "not-required"
  paymentMethod?: "online" | "transferencia" | "manual"
  duration?: number
  locationId?: string
}

interface Reservation {
  id: number
  clientName: string
  clientEmail: string
  clientPhone: string // Added clientPhone field to Reservation interface
  date: string
  time: string
  service: string
  status: "confirmed" | "completed" | "cancelled"
  totalReservations: number
  lastVisit: string
  history: Array<{ date: string; service: string; status: string }>
  appointmentId?: string // Store original appointment ID for reference
}

export default function AdminPage({ initialView }: { initialView?: AdminView }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const permissions = usePermissions()
  const crmStore = useCRMStore()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#DFDBF1]/20 to-[#AFA1FD]/10">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#AFA1FD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2C293F]/60">Cargando...</p>
        </div>
      </div>
    )
  }

  const [currentView, setCurrentView] = useState<AdminView>(initialView || "dashboard")
  const [calendarView, setCalendarView] = useState<"week" | "day">("week")
  const [currentDate, setCurrentDate] = useState(new Date())

  // Sync currentView with pathname or initialView
  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView)
      return
    }
    if (pathname === "/dashboard") setCurrentView("dashboard")
    else if (pathname === "/dashboard/services" || pathname === "/dashboard/servicios") setCurrentView("services")
    else if (pathname === "/dashboard/calendar" || pathname === "/dashboard/calendario") setCurrentView("calendar")
    else if (pathname === "/dashboard/reservations" || pathname === "/dashboard/reservas") setCurrentView("reservations")
    else if (pathname === "/dashboard/config" || pathname === "/dashboard/configuracion") setCurrentView("config")
    else if (pathname === "/dashboard/customers" || pathname === "/dashboard/clientes") setCurrentView("customers")
  }, [pathname, initialView])


  const [hoveredPackId, setHoveredPackId] = useState<string | null>(null)

  const [serviceFilter, setServiceFilter] = useState<"all" | "regular" | "packs">("all")
  const [expandedPackId, setExpandedPackId] = useState<number | null>(null)

  // Reservations will be synced from CRM store appointments
  const [reservations, setReservations] = useState<Reservation[]>([])

  const [services, setServices] = useState<Service[]>([
    {
      id: 1,
      name: "Manicura Clásica",
      description: "Limpieza, corte y pulido",
      image: "", // Placeholder for image
      duration: 30,
      price: 35,
      showPublic: true,
      requiereAdelanto: false,
      montoAdelanto: 0,
      metodoPago: "no-aplica",
      esPack: false,
    },
    {
      id: 2,
      name: "Pedicura Deluxe",
      description: "Tratamiento completo con masaje",
      image: "", // Placeholder for image
      duration: 45,
      price: 55,
      showPublic: true,
      requiereAdelanto: true,
      montoAdelanto: 20,
      metodoPago: "online",
      esPack: false,
    },
  ])

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null)
  const [serviceFormData, setServiceFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    image: "",
    duration: "",
    price: "",
    showPublic: true,
    requiereAdelanto: false,
    montoAdelanto: "",
    metodoPago: "no-aplica",
    esPack: false,
    customDays: false,
    availableDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
  })

  const [subServices, setSubServices] = useState<SubService[]>([])
  const [newSubService, setNewSubService] = useState({
    nombre: "",
    duracion: "",
    personalId: "",
    precioParcial: "",
    inicioDependiente: true,
  })

  const [isBusinessHoursModalOpen, setIsBusinessHoursModalOpen] = useState(false)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ day: number; time: string } | null>(null)

  const [occupations, setOccupations] = useState<CalendarOccupation[]>([])

  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { start: "09:00", end: "18:00", enabled: true },
    tuesday: { start: "09:00", end: "18:00", enabled: true },
    wednesday: { start: "09:00", end: "18:00", enabled: true },
    thursday: { start: "09:00", end: "18:00", enabled: true },
    friday: { start: "09:00", end: "18:00", enabled: true },
    saturday: { start: "10:00", end: "16:00", enabled: true },
    sunday: { start: "10:00", end: "16:00", enabled: false },
  })

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: 1,
      name: "María González",
      email: "maria@salon.com",
      color: "#AFA1FD",
      workingHours: {
        monday: { start: "09:00", end: "18:00", enabled: true },
        tuesday: { start: "09:00", end: "18:00", enabled: true },
        wednesday: { start: "09:00", end: "18:00", enabled: true },
        thursday: { start: "09:00", end: "18:00", enabled: true },
        friday: { start: "09:00", end: "18:00", enabled: true },
        saturday: { start: "10:00", end: "16:00", enabled: false },
        sunday: { start: "10:00", end: "16:00", enabled: false },
      },
      customDurations: {}, // Initialize customDurations
    },
  ])

  const [newStaffMember, setNewStaffMember] = useState({ 
    name: "", 
    email: "", 
    color: "#AFA1FD" 
  })

  const handleAddStaffMember = () => {
    if (!newStaffMember.name || !newStaffMember.email) {
      alert("Por favor, ingresa el nombre y email del miembro del personal.")
      return
    }
    const newMember: StaffMember = {
      id: Date.now(),
      name: newStaffMember.name,
      email: newStaffMember.email,
      color: newStaffMember.color,
      workingHours: { ...businessHours }, // Default to business hours
      customDurations: {}, // Initialize customDurations for the new member
    }
    setStaffMembers([...staffMembers, newMember])
    
    // Also save to CRM store
    if (crmStore.isLoaded) {
      crmStore.upsertStaff({
        id: newMember.id.toString(),
        name: newMember.name,
        extraMinutes: 0,
      })
    }
    
    setNewStaffMember({ name: "", email: "", color: "#AFA1FD" })
  }

  // Load staff from CRM store on mount
  useEffect(() => {
    if (crmStore.isLoaded && crmStore.data.staff.length > 0) {
      // Sync staff members with CRM store
      crmStore.data.staff.forEach((staff) => {
        const existingStaff = staffMembers.find((s) => s.id.toString() === staff.id)
        if (!existingStaff) {
          // Add to staffMembers if not exists
          const newMember: StaffMember = {
            id: parseInt(staff.id) || Date.now(),
            name: staff.name,
            email: `${staff.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
            color: "#AFA1FD",
            workingHours: { ...businessHours },
            customDurations: {},
          }
          setStaffMembers((prev) => [...prev, newMember])
        }
      })
    }
  }, [crmStore.isLoaded, crmStore.data.staff])

  // Appointments will be synced from CRM store
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([])

  const [entryType, setEntryType] = useState<"appointment" | "occupation">("appointment")

  const [newAppointment, setNewAppointment] = useState({
    client: "",
    clientEmail: "",
    clientPhone: "",
    service: "",
    staffMember: "",
    date: "",
    time: "",
    duration: 30,
    notes: "",
    adelantoPagado: false,
  })

  const [newOccupation, setNewOccupation] = useState({
    title: "",
    duration: 30,
    staffMember: "",
    notes: "",
  })

  const handleCreateAppointment = async (day: number, time: string) => {
    console.log("[v0] Opening appointment/occupation modal for", { day, time })

    const selectedDay = weekDays[day]
    const currentYear = new Date().getFullYear()
    const [dayNum, monthName] = selectedDay.date.split("/")
    const monthMap: { [key: string]: string } = {
      nov: "11",
      dic: "12",
      ene: "01",
      feb: "02",
      mar: "03",
      abr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      ago: "08",
      sep: "09",
      oct: "10",
    }
    const monthNum = monthMap[monthName] || "11"
    const formattedDate = `${currentYear}-${monthNum}-${dayNum.padStart(2, "0")}`

    setSelectedTimeSlot({ day, time })
    setNewAppointment({
      client: "",
      clientEmail: "",
      clientPhone: "",
      service: "",
      staffMember: "",
      date: formattedDate,
      time: time,
      duration: 30,
      notes: "",
      adelantoPagado: false,
    })
    setNewOccupation({
      title: "",
      duration: 30,
      staffMember: "",
      notes: "",
    })
    setEntryType("appointment")
    setIsAppointmentModalOpen(true)
  }

  const handleSaveAppointment = async () => {
    if (!selectedTimeSlot) return

    if (entryType === "appointment") {
      // Validation
      if (!newAppointment.client || !newAppointment.clientEmail || !newAppointment.service) {
        toast({
          title: "Campos requeridos",
          description: "Por favor completa el nombre del cliente, email y servicio",
          variant: "destructive",
        })
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newAppointment.clientEmail)) {
        toast({
          title: "Email inválido",
          description: "Por favor ingresa un email válido",
          variant: "destructive",
        })
        return
      }

      const selectedService = services.find((s) => s.name === newAppointment.service)

      // Get duration for the selected staff member or default to service duration
      let appointmentDuration = newAppointment.duration
      if (newAppointment.staffMember) {
        const staff = staffMembers.find((s) => s.name === newAppointment.staffMember)
        if (staff) {
          const serviceId = selectedService?.id
          if (serviceId && staff.customDurations?.[serviceId] !== undefined) {
            appointmentDuration = staff.customDurations[serviceId]
          } else if (selectedService) {
            appointmentDuration = selectedService.duration
          }
        }
      } else if (selectedService) {
        appointmentDuration = selectedService.duration
      }

      // Check for overlapping appointments (check all appointments, not just visible)
      const hasOverlap = appointments.some((apt) => {
        if (apt.day !== selectedTimeSlot.day) return false

        const aptStartMinutes = Number.parseInt(apt.time.split(":")[0]) * 60 + Number.parseInt(apt.time.split(":")[1])
        const newStartMinutes =
          Number.parseInt(newAppointment.time.split(":")[0]) * 60 + Number.parseInt(newAppointment.time.split(":")[1])
        const aptEndMinutes = aptStartMinutes + (apt.duration || 30)
        const newEndMinutes = newStartMinutes + appointmentDuration // Use calculated duration

        // Check if the current slot is within business hours
        const selectedDayHours = businessHours[weekDays[selectedTimeSlot.day].key]
        if (!selectedDayHours || !selectedDayHours.enabled) return true // Block if business is closed

        const businessStartMinutes = Number.parseInt(selectedDayHours.start.split(":")[0]) * 60 + Number.parseInt(selectedDayHours.start.split(":")[1])
        const businessEndMinutes = Number.parseInt(selectedDayHours.end.split(":")[0]) * 60 + Number.parseInt(selectedDayHours.end.split(":")[1])

        if (newStartMinutes < businessStartMinutes || newEndMinutes > businessEndMinutes) {
          return true // Block if appointment is outside business hours
        }

        return newStartMinutes < aptEndMinutes && newEndMinutes > aptStartMinutes
      })

      if (hasOverlap) {
        toast({
          title: "Conflicto de horario",
          description: "Ya existe una reserva o la hora está fuera de horario laboral. Por favor elige otro horario.",
          variant: "destructive",
        })
        return
      }

      // Save to CRM store (this will sync all views via useEffect)
      if (crmStore.isLoaded) {
        // Get or create customer
        const existingCustomer = crmStore.getCustomerByPhone(newAppointment.clientPhone || "")
        
        // Upsert customer (will get UUID from Supabase)
        await crmStore.upsertCustomer({
          id: existingCustomer?.id || `temp_${Date.now()}`, // Temporary, will be replaced
          fullName: newAppointment.client,
          phone: newAppointment.clientPhone || "",
          email: newAppointment.clientEmail,
        })

        // Get the customer ID after upsert (wait a bit for it to be saved)
        await new Promise(resolve => setTimeout(resolve, 100))
        const updatedCustomer = crmStore.getCustomerByPhone(newAppointment.clientPhone || "")
        if (!updatedCustomer || !updatedCustomer.id) {
          console.error("No se pudo obtener el ID del cliente después de guardar")
          return
        }
        const customerId = updatedCustomer.id

        // Get staff ID - find existing staff by name or use null
        let staffId: string | null = null
        if (newAppointment.staffMember) {
          const staffMember = staffMembers.find((s) => s.name === newAppointment.staffMember)
          if (staffMember) {
            // Check if staff exists in CRM store
            const existingStaff = crmStore.data.staff.find((s) => s.name === newAppointment.staffMember)
            staffId = existingStaff?.id || null
          }
        }

        // Get date from selected time slot - convert from DD/MM to YYYY-MM-DD
        const selectedDay = weekDays[selectedTimeSlot.day]
        const dateStr = selectedDay.date // Format: "DD/MM"
        const currentYear = new Date().getFullYear()
        const [day, month] = dateStr.split("/")
        const fullDate = `${currentYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`

        // Convert time to 24-hour format if needed
        let time24 = newAppointment.time
        if (newAppointment.time.includes("AM") || newAppointment.time.includes("PM")) {
          const [time, period] = newAppointment.time.split(" ")
          const [hours, minutes] = time.split(":")
          let hour24 = parseInt(hours)
          if (period === "PM" && hour24 !== 12) hour24 += 12
          if (period === "AM" && hour24 === 12) hour24 = 0
          time24 = `${hour24.toString().padStart(2, "0")}:${minutes}`
        }

        await crmStore.addAppointment({
          id: `temp_${Date.now()}`, // Temporary, will be replaced by Supabase UUID
          customerId,
          staffId: staffId || undefined,
          serviceName: newAppointment.service,
          date: fullDate,
          startTime: time24,
          baseDuration: appointmentDuration,
          inspirationImages: [],
          notes: newAppointment.notes,
        })

        // Reload CRM store to sync all views
        await new Promise(resolve => setTimeout(resolve, 300))
        crmStore.reload()
      }

      // Close modal
      setIsAppointmentModalOpen(false)
      setNewAppointment({
        client: "",
        clientEmail: "",
        clientPhone: "",
        service: "",
        staffMember: "",
        date: "",
        time: "",
        duration: 30,
        notes: "",
        adelantoPagado: false,
      })
      setSelectedTimeSlot(null)

      toast({
        title: "Reserva creada correctamente ✨",
        description: `Cita para ${newAppointment.client} el ${newAppointment.date} a las ${newAppointment.time}`,
      })
    } else {
      if (!newOccupation.title) {
        toast({
          title: "Campo requerido",
          description: "Por favor ingresa un título para la ocupación",
          variant: "destructive",
        })
        return
      }

      const occupation: CalendarOccupation = {
        id: Date.now(),
        day: selectedTimeSlot.day,
        time: selectedTimeSlot.time,
        title: newOccupation.title,
        duration: newOccupation.duration,
        staffMember: newOccupation.staffMember,
        notes: newOccupation.notes,
      }

      setOccupations([...occupations, occupation])

      toast({
        title: "Ocupación creada correctamente",
        description: `${newOccupation.title} el ${weekDays[selectedTimeSlot.day].date} a las ${selectedTimeSlot.time}`,
      })
    }

    setIsAppointmentModalOpen(false)
  }

  const handleDeleteOccupation = (id: number) => {
    setOccupations(occupations.filter((occ) => occ.id !== id))
  }

  const handleDeleteAppointment = (id: string) => {
    // Changed id to string
    if (confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
      setAppointments(appointments.filter((apt) => apt.id !== id))
    }
  }

  const handleCreateService = () => {
    setEditingServiceId(null)
    setServiceFormData({
      name: "",
      description: "",
      image: "",
      duration: "",
      price: "",
      showPublic: true,
      requiereAdelanto: false,
      montoAdelanto: "",
      metodoPago: "no-aplica",
      esPack: false,
      customDays: false,
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
    })
    setSubServices([])
    setNewSubService({
      nombre: "",
      duracion: "",
      personalId: "",
      precioParcial: "",
      inicioDependiente: true,
    })
    setIsServiceModalOpen(true)
  }

  const handleEditService = (service: Service) => {
    setEditingServiceId(service.id)
    const hasCustomDays = service.availableDays && !Object.values(service.availableDays).every((day) => day === true)
    setServiceFormData({
      name: service.name,
      description: service.description,
      image: service.image || "",
      duration: service.duration.toString(),
      price: service.price.toString(),
      showPublic: service.showPublic,
      requiereAdelanto: service.requiereAdelanto,
      montoAdelanto: service.montoAdelanto.toString(),
      metodoPago: service.metodoPago,
      esPack: service.esPack,
      customDays: hasCustomDays || false,
      availableDays: service.availableDays || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
    })
    setSubServices(service.subservicios || [])
    setIsServiceModalOpen(true)
  }

  const handleAddSubService = () => {
    if (!newSubService.nombre || !newSubService.duracion || !newSubService.personalId) {
      alert("Por favor completa todos los campos del subservicio")
      return
    }

    const staff = staffMembers.find((s) => s.id === Number.parseInt(newSubService.personalId))
    if (!staff) {
      alert("Por favor selecciona un miembro del personal válido")
      return
    }

    const subService: SubService = {
      id: Date.now().toString(),
      nombre: newSubService.nombre,
      duracion: Number.parseInt(newSubService.duracion),
      personalId: Number.parseInt(newSubService.personalId),
      personalName: staff.name,
      precioParcial: newSubService.precioParcial ? Number.parseFloat(newSubService.precioParcial) : 0,
      inicioDependiente: newSubService.inicioDependiente,
    }

    setSubServices([...subServices, subService])
    setNewSubService({
      nombre: "",
      duracion: "",
      personalId: "",
      precioParcial: "",
      inicioDependiente: true,
    })
  }

  const handleRemoveSubService = (id: string) => {
    setSubServices(subServices.filter((s) => s.id !== id))
  }

  const handleSaveService = async () => {
    if (!serviceFormData.name || !serviceFormData.price) {
      // Removed duration validation for packs
      alert("Por favor completa todos los campos requeridos")
      return
    }

    if (serviceFormData.esPack && subServices.length === 0) {
      alert("Un servicio pack debe tener al menos un subservicio")
      return
    }

    if (serviceFormData.requiereAdelanto) {
      const depositAmount = Number.parseFloat(serviceFormData.montoAdelanto)
      const totalPrice = Number.parseFloat(serviceFormData.price)

      if (!serviceFormData.montoAdelanto || depositAmount <= 0) {
        alert("Por favor ingresa un monto de adelanto válido")
        return
      }

      if (depositAmount > totalPrice) {
        alert("El monto del adelanto no puede ser mayor al precio total")
        return
      }
    }

    const newService: Service = {
      id: editingServiceId || Date.now(),
      name: serviceFormData.name,
      description: serviceFormData.description,
      image: serviceFormData.image,
      duration: serviceFormData.esPack
        ? subServices.reduce((acc, sub) => acc + sub.duracion, 0)
        : Number.parseInt(serviceFormData.duration),
      price: Number.parseFloat(serviceFormData.price),
      showPublic: serviceFormData.showPublic,
      requiereAdelanto: serviceFormData.requiereAdelanto,
      montoAdelanto: Number.parseFloat(serviceFormData.montoAdelanto) || 0,
      metodoPago: serviceFormData.metodoPago,
      esPack: serviceFormData.esPack,
      subservicios: serviceFormData.esPack ? subServices : undefined,
      availableDays: serviceFormData.customDays ? serviceFormData.availableDays : undefined,
    }

    let updatedServices: Service[]
    if (editingServiceId) {
      updatedServices = services.map((s) => (s.id === editingServiceId ? newService : s))
    } else {
      updatedServices = [...services, newService]
    }
    setServices(updatedServices)

    // Save to Supabase or localStorage
    await saveServicesToSupabase(updatedServices.map((s) => ({
      id: s.id.toString(),
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
      availableDays: s.availableDays,
      customDays: !!s.availableDays,
    })))

    setIsServiceModalOpen(false)
    setServiceFormData({
      name: "",
      description: "",
      image: "",
      duration: "",
      price: "",
      showPublic: true,
      requiereAdelanto: false,
      montoAdelanto: "",
      metodoPago: "no-aplica",
      esPack: false,
      customDays: false,
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
    })
  }

  const handleDeleteService = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
      const updatedServices = services.filter((s) => s.id !== id)
      setServices(updatedServices)
      // Save to Supabase or localStorage
      await saveServicesToSupabase(updatedServices.map((s) => ({
        id: s.id.toString(),
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
        availableDays: s.availableDays,
        customDays: !!s.availableDays,
      })))
      // Also save to localStorage as backup
      localStorage.setItem("lilaServices", JSON.stringify(updatedServices))
    }
  }

  // Calculate upcoming appointments from CRM store (today and future)
  const upcomingAppointments = useMemo(() => {
    if (!crmStore.isLoaded || !crmStore.data) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const appointments = crmStore.data.appointments || []
    const customers = crmStore.data.customers || []
    
    return appointments
      .filter((apt) => {
        const aptDate = new Date(apt.date + "T" + apt.startTime)
        aptDate.setHours(0, 0, 0, 0)
        return aptDate >= today
      })
      .sort((a, b) => {
        const dateA = new Date(a.date + "T" + a.startTime)
        const dateB = new Date(b.date + "T" + b.startTime)
        return dateA.getTime() - dateB.getTime()
      })
      .slice(0, 5) // Get top 5 upcoming
      .map((apt) => {
        const customer = customers.find((c) => c.id === apt.customerId)
        const [hours, minutes] = apt.startTime.split(":")
        const hour24 = parseInt(hours)
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
        const period = hour24 >= 12 ? "PM" : "AM"
        const time12 = `${hour12}:${minutes} ${period}`
        
        return {
          id: apt.id,
          client: customer?.fullName || "Cliente desconocido",
          service: apt.serviceName,
          time: time12,
          status: "Confirmada",
        }
      })
  }, [crmStore.isLoaded, crmStore.data])

  // Calculate recent reservations from reservations state
  const recentReservations = useMemo(() => {
    return reservations
      .sort((a, b) => {
        const dateA = new Date(a.date + "T" + a.time)
        const dateB = new Date(b.date + "T" + b.time)
        return dateB.getTime() - dateA.getTime() // Most recent first
      })
      .slice(0, 5) // Get top 5 recent
      .map((res) => ({
        id: res.id,
        text: `${res.clientName} - ${res.service} - ${getStatusConfig(res.status).label}`,
      }))
  }, [reservations])

  const getWeekDays = (date: Date) => {
    const days = []
    const currentDay = new Date(date)
    const dayOfWeek = currentDay.getDay()
    const diff = currentDay.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust for Monday start
    const sunday = new Date(currentDay.setDate(diff))

    const dayNames = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]
    const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday)
      day.setDate(sunday.getDate() + i)
      days.push({
        day: dayNames[i],
        date: `${day.getDate()}/${monthNames[day.getMonth()]}`,
        fullDate: day,
        key: dayNames[i], // Key for businessHours object
      })
    }
    return days
  }

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const weekDays = getWeekDays(currentDate)

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

  const [copiedLink, setCopiedLink] = useState(false)
  const [businessInfo, setBusinessInfo] = useState({
    name: "Mi Salón de Belleza",
    address: "Calle Principal 123, Ciudad",
    phone: "+1 234 567 8900",
    email: "contacto@misalon.com",
    publicSlug: "mi-salon-belleza",
    brandColor: "#AFA1FD",
    logo: "", // Added logo field
  })

  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [qrGenerated, setQrGenerated] = useState(false)
  const [calendarConnected, setCalendarConnected] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null) // Declare logoInputRef

  // Use Supabase hooks
  const { businessInfo: supabaseBusinessInfo, isLoaded: businessInfoLoaded, saveBusinessInfo: saveBusinessInfoToSupabase } = useBusinessInfo()
  const { services: supabaseServices, isLoaded: servicesLoaded, saveServices: saveServicesToSupabase } = useServices()

  // Sync business info from Supabase
  useEffect(() => {
    if (businessInfoLoaded && supabaseBusinessInfo) {
      setBusinessInfo({
        name: supabaseBusinessInfo.name || "",
        email: supabaseBusinessInfo.email || "",
        phone: supabaseBusinessInfo.phone || "",
        address: supabaseBusinessInfo.address || "",
        logo: supabaseBusinessInfo.logo || "",
        brandColor: supabaseBusinessInfo.brandColor || "#AFA1FD",
        publicSlug: supabaseBusinessInfo.publicLink || "",
      })
    } else if (businessInfoLoaded && !supabaseBusinessInfo) {
      // Fallback to localStorage if Supabase not configured
    const savedBusinessInfo = localStorage.getItem("lilaBusinessInfo")
    if (savedBusinessInfo) {
      setBusinessInfo(JSON.parse(savedBusinessInfo))
    }
    }
  }, [businessInfoLoaded, supabaseBusinessInfo])

  // Sync services from Supabase
  useEffect(() => {
    if (servicesLoaded && supabaseServices.length > 0) {
      setServices(supabaseServices.map((s) => ({
        id: parseInt(s.id) || Date.now(),
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
        availableDays: s.availableDays,
      })))
    } else if (servicesLoaded && supabaseServices.length === 0) {
      // Fallback to localStorage if Supabase not configured
      const savedServices = localStorage.getItem("lilaServices")
      if (savedServices) {
        setServices(JSON.parse(savedServices))
      }
    }
  }, [servicesLoaded, supabaseServices])

  // Sync reservations from CRM store appointments
  useEffect(() => {
    if (crmStore.isLoaded && crmStore.data.appointments.length > 0) {
      // Group appointments by customer to calculate totalReservations and history
      const customerAppointments = new Map<string, typeof crmStore.data.appointments>()
      
      crmStore.data.appointments.forEach((apt) => {
        if (!customerAppointments.has(apt.customerId)) {
          customerAppointments.set(apt.customerId, [])
        }
        customerAppointments.get(apt.customerId)!.push(apt)
      })

      // Convert appointments to reservations
      const newReservations: Reservation[] = crmStore.data.appointments.map((apt) => {
        const customer = crmStore.data.customers.find((c) => c.id === apt.customerId)
        if (!customer) return null

        // Get all appointments for this customer
        const customerApts = customerAppointments.get(apt.customerId) || []
        const sortedApts = [...customerApts].sort((a, b) => {
          const dateA = new Date(a.date + "T" + a.startTime)
          const dateB = new Date(b.date + "T" + b.startTime)
          return dateB.getTime() - dateA.getTime() // Most recent first
        })

        // Calculate total reservations and last visit
        const totalReservations = customerApts.length
        const lastVisit = sortedApts.length > 0 ? sortedApts[0].date : "N/A"

        // Build history (excluding current appointment)
        const history = sortedApts
          .filter((a) => a.id !== apt.id)
          .map((a) => ({
            date: a.date,
            service: a.serviceName,
            status: "completed" as const, // Default status for history
          }))

        // Convert time from 24-hour to 12-hour format
        const [hours, minutes] = apt.startTime.split(":")
        const hour24 = parseInt(hours)
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
        const period = hour24 >= 12 ? "PM" : "AM"
        const time12 = `${hour12}:${minutes} ${period}`

        // Determine status (default to "confirmed" for new appointments)
        let status: "confirmed" | "completed" | "cancelled" = "confirmed"
        // You can add logic here to determine status based on date or other criteria
        const appointmentDate = new Date(apt.date + "T" + apt.startTime)
        const now = new Date()
        if (appointmentDate < now) {
          status = "completed" // Past appointments are completed
        }

        // Generate a numeric ID from the appointment UUID for compatibility
        const numericId = apt.id ? parseInt(apt.id.replace(/-/g, "").substring(0, 8), 16) || Date.now() : Date.now()

        return {
          id: numericId,
          clientName: customer.fullName,
          clientEmail: customer.email || "",
          clientPhone: customer.phone,
          date: apt.date,
          time: time12,
          service: apt.serviceName,
          status: status as "confirmed" | "completed" | "cancelled",
          totalReservations: totalReservations,
          lastVisit: lastVisit,
          history: history,
          // Store the original appointment ID for reference
          appointmentId: apt.id,
        }
      }).filter((res) => res !== null) as Reservation[]

      setReservations(newReservations)
    } else if (crmStore.isLoaded && crmStore.data && (!crmStore.data.appointments || crmStore.data.appointments.length === 0)) {
      // No appointments yet, keep empty array
      setReservations([])
    }
  }, [crmStore.isLoaded, crmStore.data])

  // Sync calendar appointments from CRM store
  useEffect(() => {
    if (crmStore.isLoaded && crmStore.data) {
      const appointments = crmStore.data.appointments || []
      const customers = crmStore.data.customers || []
      const staff = crmStore.data.staff || []
      
      if (appointments.length > 0) {
        const calendarAppointments: CalendarAppointment[] = appointments.map((apt) => {
          const customer = customers.find((c) => c.id === apt.customerId)
          const staffMember = staff.find((s) => s.id === apt.staffId)
          
          // Convert date to day of week (0 = Sunday, 6 = Saturday)
          const aptDate = new Date(apt.date)
          const dayOfWeek = aptDate.getDay()
          
          // Determine status based on date
          const now = new Date()
          let status: "confirmed" | "pending" | "completed" | "cancelled" = "confirmed"
          if (aptDate < now) {
            status = "completed"
          }
          
          return {
            id: apt.id,
            day: dayOfWeek,
            time: apt.startTime,
            client: customer?.fullName || "Cliente desconocido",
            clientEmail: customer?.email || "",
            clientPhone: customer?.phone || "",
            service: apt.serviceName,
            staffMember: staffMember?.name || "",
            status: status,
            isManual: false,
            paymentStatus: "pending",
            paymentMethod: "online",
            duration: services.find((s) => s.name === apt.serviceName)?.duration || apt.baseDuration || 30,
          }
        })
        
        setAppointments(calendarAppointments)
      } else {
        setAppointments([])
      }
    }
  }, [crmStore.isLoaded, crmStore.data, services])

  const handleSaveBusinessInfo = async () => {
    // Validate required fields
    if (!businessInfo.name || !businessInfo.email || !businessInfo.phone) {
      setSaveMessage("Por favor completa todos los campos requeridos")
      setTimeout(() => setSaveMessage(null), 3000)
      return
    }

    // Save to Supabase or localStorage
    await saveBusinessInfoToSupabase({
      name: businessInfo.name,
      email: businessInfo.email,
      phone: businessInfo.phone,
      address: businessInfo.address,
      logo: businessInfo.logo,
      brandColor: businessInfo.brandColor,
      publicLink: businessInfo.publicSlug,
    })
    setSaveMessage("Cambios guardados exitosamente")
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoUploading(true)
      // Simulate upload and create preview URL
      const reader = new FileReader()
      reader.onloadend = async () => {
        const updatedInfo = { ...businessInfo, logo: reader.result as string }
        setBusinessInfo(updatedInfo)
        await saveBusinessInfoToSupabase({
          name: updatedInfo.name,
          email: updatedInfo.email,
          phone: updatedInfo.phone,
          address: updatedInfo.address,
          logo: updatedInfo.logo,
          brandColor: updatedInfo.brandColor,
          publicLink: updatedInfo.publicSlug,
        })
        setLogoUploading(false)
        setSaveMessage("Logo subido exitosamente")
        setTimeout(() => setSaveMessage(null), 3000)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoUpload = () => {
    logoInputRef.current?.click()
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://lila.app/${businessInfo.publicSlug}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleConnectGoogleCalendar = () => {
    setCalendarConnected(true)
    setSaveMessage("Conectado con Google Calendar exitosamente")
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handleGenerateQR = () => {
    setQrGenerated(true)
    setSaveMessage("Código QR generado exitosamente")
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handleApplyBrandColor = async () => {
    // Save brand color to Supabase or localStorage
    await saveBusinessInfoToSupabase({
      name: businessInfo.name,
      email: businessInfo.email,
      phone: businessInfo.phone,
      address: businessInfo.address,
      logo: businessInfo.logo,
      brandColor: businessInfo.brandColor,
      publicLink: businessInfo.publicSlug,
    })
    // Also save services
    await saveServicesToSupabase(services.map((s) => ({
      id: s.id.toString(),
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
      availableDays: s.availableDays,
      customDays: !!s.availableDays,
    })))
    // Also save to localStorage as backup
    localStorage.setItem("lilaBrandColor", businessInfo.brandColor)
    localStorage.setItem("lilaBusinessInfo", JSON.stringify(businessInfo))
    localStorage.setItem("lilaServices", JSON.stringify(services))
    setSaveMessage("Color de marca aplicado exitosamente")
    setTimeout(() => setSaveMessage(null), 3000)
  }

  // Filter reservations
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all") // "all", "today", "week", "month", "custom"
  const [customDateFrom, setCustomDateFrom] = useState("")
  const [customDateTo, setCustomDateTo] = useState("")
  const [expandedReservation, setExpandedReservation] = useState<number | null>(null)

  const getLoyaltyLevel = (totalReservations: number) => {
    if (totalReservations >= 10) {
      return { label: "VIP", color: "#E63946", bgColor: "#FFEDEF" }
    } else if (totalReservations >= 5) {
      return { label: "Frecuente", color: "#FFA500", bgColor: "#FFF5E6" }
    } else {
      return { label: "Nuevo", color: "#6c757d", bgColor: "#f8f9fa" }
    }
  }

  const getStatusConfig = (status: Reservation["status"]) => {
    switch (status) {
      case "confirmed":
        return { label: "Confirmada", color: "#007bff", bgColor: "#e7f3ff" }
      case "completed":
        return { label: "Completada", color: "#28a745", bgColor: "#e2f5e6" }
      case "cancelled":
        return { label: "Cancelada", color: "#dc3545", bgColor: "#fce9ea" }
      default:
        return { label: "Desconocido", color: "#6c757d", bgColor: "#f8f9fa" }
    }
  }

  const handleCompleteReservation = (id: number) => {
    setReservations(reservations.map((res) => (res.id === id ? { ...res, status: "completed" } : res)))
    setSaveMessage("Reserva marcada como completada.")
  }

  const handleCancelReservation = (id: number) => {
    setReservations(reservations.map((res) => (res.id === id ? { ...res, status: "cancelled" } : res)))
    setSaveMessage("Reserva cancelada.")
  }

  // Filtros de datos según rol
  const visibleAppointments = useMemo(() => {
    if (!user) return []
    
    if (user.role === "staff") {
      return appointments.filter(apt => 
        apt.staffMember === user.name
      )
    }
    
    if (user.role === "dueno") {
      return appointments // Todos los locales
    }
    
    // Admin y Recepcionista: todos los appointments (locationId no implementado aún)
    return appointments
  }, [appointments, user])

  const visibleReservations = useMemo(() => {
    if (!user || user.role === "staff") return []
    
    if (user.role === "dueno") {
      return reservations // Todas
    }
    
    // Admin y Recepcionista: todas las reservas (locationId no implementado aún)
    return reservations
  }, [reservations, user])

  const filteredReservations = visibleReservations.filter((res) => {
    const matchesSearch =
      res.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.clientPhone.toLowerCase().includes(searchQuery.toLowerCase()) // Added search by clientPhone
    const matchesStatus = statusFilter === "all" || res.status === statusFilter
    
    // Date filter logic
    let matchesDate = true
    if (dateFilter !== "all") {
      const reservationDate = new Date(res.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (dateFilter === "today") {
        const resDateOnly = new Date(reservationDate)
        resDateOnly.setHours(0, 0, 0, 0)
        matchesDate = resDateOnly.getTime() === today.getTime()
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        matchesDate = reservationDate >= weekAgo && reservationDate <= today
      } else if (dateFilter === "month") {
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        matchesDate = reservationDate >= monthAgo && reservationDate <= today
      } else if (dateFilter === "custom") {
        if (customDateFrom && customDateTo) {
          const fromDate = new Date(customDateFrom)
          const toDate = new Date(customDateTo)
          toDate.setHours(23, 59, 59, 999) // Include the entire end date
          matchesDate = reservationDate >= fromDate && reservationDate <= toDate
        } else if (customDateFrom) {
          const fromDate = new Date(customDateFrom)
          matchesDate = reservationDate >= fromDate
        } else if (customDateTo) {
          const toDate = new Date(customDateTo)
          toDate.setHours(23, 59, 59, 999)
          matchesDate = reservationDate <= toDate
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const filteredServices = services.filter((service) => {
    if (serviceFilter === "all") return true
    if (serviceFilter === "packs") return service.esPack
    if (serviceFilter === "regular") return !service.esPack
    return true
  })

  const packStats = {
    totalPacks: services.filter((s) => s.esPack).length,
    totalRegular: services.filter((s) => !s.esPack).length,
    packBookings: visibleAppointments.filter((apt) => apt.isPack).length,
    regularBookings: visibleAppointments.filter((apt) => !apt.isPack).length,
  }

  // Function to handle service image change
  const handleServiceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setServiceFormData({ ...serviceFormData, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50 relative overflow-hidden">

      <main className="overflow-auto relative">
        <div className="p-4 lg:p-8">
          <AnimatePresence>
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-4 right-4 z-50 bg-white border-2 border-[#AFA1FD] rounded-xl shadow-2xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#AFA1FD] to-[#8B7FE8] flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <p className="text-[#2C293F] font-semibold">{saveMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* Dashboard View */}
            {currentView === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8"
              >
                <div className="mb-8">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-[#2C293F] via-[#AFA1FD] to-[#2C293F] bg-clip-text text-transparent mb-3">
                    Dashboard
                  </h1>
                  <p className="text-[#AFA1FD] text-lg font-medium">Bienvenido al panel administrativo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {useMemo(() => {
                    // Calculate metrics from real data
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    
                    // Count appointments today
                    const todayAppointments = crmStore.isLoaded
                      ? crmStore.data.appointments.filter((apt) => {
                          const aptDate = new Date(apt.date + "T" + apt.startTime)
                          aptDate.setHours(0, 0, 0, 0)
                          return aptDate.getTime() === today.getTime()
                        }).length
                      : 0
                    
                    // Count unique customers this month
                    const thisMonth = new Date()
                    thisMonth.setDate(1)
                    thisMonth.setHours(0, 0, 0, 0)
                    const thisMonthCustomers = crmStore.isLoaded
                      ? new Set(
                          crmStore.data.appointments
                            .filter((apt) => {
                              const aptDate = new Date(apt.date)
                              return aptDate >= thisMonth
                            })
                            .map((apt) => apt.customerId)
                        ).size
                      : 0
                    
                    // Calculate estimated income (sum of service prices)
                    const estimatedIncome = crmStore.isLoaded
                      ? crmStore.data.appointments
                          .filter((apt) => {
                            const aptDate = new Date(apt.date)
                            return aptDate >= thisMonth
                          })
                          .reduce((sum, apt) => {
                            const service = services.find((s) => s.name === apt.serviceName)
                            return sum + (service?.price || 0)
                          }, 0)
                      : 0
                    
                    // Calculate occupancy rate (simplified: appointments / available slots)
                    const occupancyRate = crmStore.isLoaded && crmStore.data.appointments.length > 0
                      ? Math.min(100, Math.round((crmStore.data.appointments.length / 50) * 100))
                      : 0
                    
                    return [
                    {
                      title: "Próximas citas",
                        value: todayAppointments.toString(),
                      subtitle: "Hoy",
                      icon: Calendar,
                      gradient: "from-purple-500 to-purple-600",
                      bgGradient: "from-purple-50 to-purple-100",
                    },
                    {
                      title: "Clientes recurrentes",
                        value: thisMonthCustomers.toString(),
                      subtitle: "Este mes",
                      icon: Users,
                      gradient: "from-blue-500 to-blue-600",
                      bgGradient: "from-blue-50 to-blue-100",
                    },
                    {
                      title: "Ingresos estimados",
                        value: `S/. ${estimatedIncome.toLocaleString()}`,
                      subtitle: "Este mes",
                      icon: DollarSign,
                      gradient: "from-green-500 to-green-600",
                      bgGradient: "from-green-50 to-green-100",
                    },
                    {
                      title: "Tasa de ocupación",
                        value: `${occupancyRate}%`,
                      subtitle: "Promedio",
                      icon: BarChart3,
                      gradient: "from-orange-500 to-orange-600",
                      bgGradient: "from-orange-50 to-orange-100",
                    },
                    ]
                  }, [crmStore.isLoaded, crmStore.data.appointments, services]).map((metric, index) => (
                    <motion.div
                      key={metric.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8, transition: { duration: 0.2 } }}
                      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 relative overflow-hidden group"
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-gray-600 text-sm font-semibold mb-2">{metric.title}</p>
                            <p className="text-4xl font-bold text-[#2C293F]">{metric.value}</p>
                          </div>
                          <div
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-lg`}
                          >
                            <metric.icon className="w-7 h-7 text-white" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{metric.subtitle}</p>
                        <p className="text-sm text-green-600 flex items-center gap-1 font-medium">
                          <TrendingUp className="w-4 h-4" />
                          Comparado al mes anterior
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#AFA1FD]/20 to-transparent rounded-full blur-2xl" />

                    <h2 className="text-2xl font-bold text-[#2C293F] mb-6 flex items-center gap-2">
                      Próximas citas
                      <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {upcomingAppointments.length}
                      </span>
                    </h2>
                    <div className="space-y-3">
                      {upcomingAppointments.map((apt, index) => (
                        <motion.div
                          key={apt.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/50 rounded-xl hover:shadow-md transition-all group"
                        >
                          <div>
                            <p className="font-semibold text-[#2C293F] group-hover:text-[#AFA1FD] transition-colors mx-0 px-0 py-0 my-0 leading-7">
                              {apt.client}
                            </p>
                            <p className="text-sm text-gray-600">
                              {apt.service} • {apt.time}
                            </p>
                          </div>
                          <span className="px-4 py-2 bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white rounded-lg text-sm font-medium shadow-md">
                            {apt.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative overflow-hidden"
                  >
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#AFA1FD]/20 to-transparent rounded-full blur-3xl" />

                    <h2 className="text-2xl font-bold text-[#2C293F] mb-6">Últimas reservas</h2>
                    <div className="space-y-4">
                      {recentReservations.map((res, index) => (
                        <motion.div
                          key={res.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0 group hover:pl-2 transition-all"
                        >
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8]" />
                          <p className="text-gray-700 group-hover:text-[#AFA1FD] transition-colors">{res.text}</p>
                          <ArrowUpRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Services View */}
            {currentView === "services" && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-[#2C293F] via-[#AFA1FD] to-[#2C293F] bg-clip-text text-transparent mb-1 sm:mb-3 break-words">
                      Servicios
                    </h1>
                    <p className="text-[#AFA1FD] text-lg font-medium">Gestiona los servicios que ofrece tu negocio</p>
                  </div>
                  {permissions.canEditServices && (
                  <Button
                    onClick={handleCreateService}
                    className="bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] hover:from-[#9890E8] hover:to-[#7A6FD8] text-white gap-2 shadow-lg shadow-[#AFA1FD]/30 px-4 sm:px-6 py-4 sm:py-6 text-sm sm:text-base whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xs:inline">Crear servicio</span>
                    <span className="xs:hidden">Crear</span>
                  </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Servicios</p>
                        <p className="text-3xl font-bold text-[#2C293F]">{services.length}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#AFA1FD] to-[#8B7FE8] flex items-center justify-center">
                        <Scissors className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Packs Activos</p>
                        <p className="text-3xl font-bold text-[#AFA1FD]">{packStats.totalPacks}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <Button
                    onClick={() => setServiceFilter("all")}
                    variant={serviceFilter === "all" ? "default" : "outline"}
                    className={
                      serviceFilter === "all"
                        ? "bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white"
                        : "border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] bg-transparent"
                    }
                  >
                    Todos ({services.length})
                  </Button>
                  <Button
                    onClick={() => setServiceFilter("packs")}
                    variant={serviceFilter === "packs" ? "default" : "outline"}
                    className={
                      serviceFilter === "packs"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 bg-transparent"
                    }
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Packs ({packStats.totalPacks})
                  </Button>
                  <Button
                    onClick={() => setServiceFilter("regular")}
                    variant={serviceFilter === "regular" ? "default" : "outline"}
                    className={
                      serviceFilter === "regular"
                        ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                        : "border-2 border-gray-300 hover:border-gray-500 hover:text-gray-600 bg-transparent"
                    }
                  >
                    Regulares ({packStats.totalRegular})
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#AFA1FD] transition-all shadow-sm hover:shadow-lg group"
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        {service.image ? (
                          <img
                            src={service.image || "/placeholder.svg"}
                            alt={service.name}
                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border-2 border-gray-100"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#AFA1FD] to-[#8B7FE8] flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-10 h-10 text-white" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <h3 className="text-xl sm:text-2xl font-bold text-[#2C293F] break-words">
                                {service.name}
                              </h3>
                              {service.esPack && (
                                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-semibold flex items-center gap-1 flex-shrink-0">
                                  <Package className="w-3 h-3" />
                                  Pack
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {permissions.canEditServices && (
                              <Button
                                onClick={() => handleEditService(service)}
                                variant="outline"
                                size="sm"
                                className="border-2 border-[#AFA1FD] text-[#AFA1FD] hover:bg-[#AFA1FD] hover:text-white transition-all bg-transparent text-xs sm:text-sm whitespace-nowrap"
                              >
                                Editar
                              </Button>
                              )}
                              {permissions.canDeleteServices && (
                              <Button
                                onClick={() => handleDeleteService(service.id)}
                                variant="outline"
                                size="sm"
                                className="border-2 border-red-300 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all bg-transparent text-xs sm:text-sm whitespace-nowrap"
                              >
                                Eliminar
                              </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4 text-sm sm:text-base break-words">{service.description}</p>

                          <div className="flex flex-wrap items-start sm:items-center gap-3 text-sm sm:text-base">
                            {!service.esPack && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#AFA1FD]" />
                                <span className="font-semibold text-gray-700">{service.duration} min</span>
                              </div>
                            )}
                            {service.esPack && service.subservicios && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="font-semibold text-gray-700">
                                  {service.subservicios.reduce((acc, sub) => acc + sub.duracion, 0)} min total
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="font-semibold text-gray-700">S/. {service.price}</span>
                            </div>
                            {service.requiereAdelanto && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                <span className="font-semibold text-gray-700">Adelanto: S/. {service.montoAdelanto}</span>
                              </div>
                            )}
                            {service.esPack && service.subservicios && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                <span className="font-semibold text-gray-700">
                                  {service.subservicios.length} subservicios
                                </span>
                              </div>
                            )}
                          </div>

                          {service.esPack && service.subservicios && service.subservicios.length > 0 && (
                            <div className="mt-4">
                              <button
                                onClick={() => setExpandedPackId(expandedPackId === service.id ? null : service.id)}
                                className="flex items-center gap-2 text-sm font-semibold text-[#AFA1FD] hover:text-[#8B7FE8] transition-colors"
                              >
                                <motion.div
                                  animate={{ rotate: expandedPackId === service.id ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </motion.div>
                                {expandedPackId === service.id ? "Ocultar" : "Ver"} subservicios
                              </button>

                              <AnimatePresence>
                                {expandedPackId === service.id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-3 space-y-2 pl-6 border-l-2 border-[#AFA1FD]/30">
                                      {service.subservicios.map((sub, idx) => (
                                        <div
                                          key={sub.id}
                                          className="flex items-center justify-between p-3 bg-gradient-to-r from-[#AFA1FD]/5 to-transparent rounded-lg"
                                        >
                                          <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-[#AFA1FD] bg-[#AFA1FD]/10 px-2 py-1 rounded">
                                              #{idx + 1}
                                            </span>
                                            <div>
                                              <p className="font-semibold text-[#2C293F] text-sm">{sub.nombre}</p>
                                              <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                                                <span className="flex items-center gap-1">
                                                  <Clock className="w-3 h-3" />
                                                  {sub.duracion} min
                                                </span>
                                                <span className="flex items-center gap-1">
                                                  <User className="w-3 h-3" />
                                                  {sub.personalName}
                                                </span>
                                                {sub.precioParcial > 0 && (
                                                  <span className="flex items-center gap-1">
                                                    <span className="text-xs font-semibold">S/. {sub.precioParcial}</span>
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          {sub.inicioDependiente && idx > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-[#AFA1FD] bg-[#AFA1FD]/10 px-2 py-1 rounded">
                                              <ArrowRight className="w-3 h-3" />
                                              Consecutivo
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {filteredServices.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-12 shadow-sm border-2 border-dashed border-gray-300 text-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        {serviceFilter === "packs" ? (
                          <Package className="w-10 h-10 text-gray-400" />
                        ) : (
                          <Scissors className="w-10 h-10 text-gray-400" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-700 mb-2">
                        {serviceFilter === "packs"
                          ? "No hay packs creados"
                          : serviceFilter === "regular"
                            ? "No hay servicios regulares"
                            : "No hay servicios"}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {serviceFilter === "packs"
                          ? "Crea tu primer pack combinando múltiples servicios"
                          : "Comienza agregando servicios a tu negocio"}
                      </p>
                      <Button
                        onClick={handleCreateService}
                        className="bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] hover:from-[#9890E8] hover:to-[#7A6FD8] text-white gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Crear {serviceFilter === "packs" ? "pack" : "servicio"}
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Calendar View */}
            {currentView === "calendar" && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 md:p-8"
              >
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md -mx-4 md:mx-0 px-4 md:px-0 py-4 md:py-0 md:static mb-6 md:mb-8 border-b md:border-b-0 border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                    <div>
                      <h1 className="text-2xl md:text-5xl font-bold bg-gradient-to-r from-[#2C293F] via-[#AFA1FD] to-[#2C293F] bg-clip-text text-transparent mb-1 md:mb-3 break-words">
                        Calendario
                      </h1>
                      <p className="text-[#AFA1FD] text-sm md:text-lg font-medium">Gestiona tu horario y reservas</p>
                    </div>

                    {/* Desktop view toggle */}
                    <div className="hidden md:flex gap-2">
                      <Button
                        onClick={() => setCalendarView("week")}
                        className={
                          calendarView === "week"
                            ? "bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white hover:from-[#9890E8] hover:to-[#7A6FD8] shadow-lg"
                            : "bg-transparent border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] text-gray-700"
                        }
                      >
                        Semana
                      </Button>
                      <Button
                        onClick={() => setCalendarView("day")}
                        variant="outline"
                        className={
                          calendarView === "day"
                            ? "bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white hover:from-[#9890E8] hover:to-[#7A6FD8] shadow-lg border-0"
                            : "border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] bg-transparent"
                        }
                      >
                        Día
                      </Button>
                    </div>

                    {/* Mobile view toggle - segmented control */}
                    <div className="flex md:hidden bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setCalendarView("week")}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                          calendarView === "week"
                            ? "bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white shadow-md"
                            : "text-gray-600"
                        }`}
                      >
                        Semana
                      </button>
                      <button
                        onClick={() => setCalendarView("day")}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                          calendarView === "day"
                            ? "bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white shadow-md"
                            : "text-gray-600"
                        }`}
                      >
                        Día
                      </button>
                    </div>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between mt-4">
                    {/* Desktop navigation */}
                    <div className="hidden md:flex items-center gap-4">
                      <Button
                        onClick={handlePreviousWeek}
                        variant="outline"
                        size="sm"
                        className="border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] bg-transparent"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Anterior
                      </Button>
                      <Button
                        onClick={handleToday}
                        variant="outline"
                        size="sm"
                        className="border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] bg-transparent"
                      >
                        Hoy
                      </Button>
                      <Button
                        onClick={handleNextWeek}
                        variant="outline"
                        size="sm"
                        className="border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] bg-transparent"
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>

                    {/* Mobile navigation - compact */}
                    <div className="flex md:hidden items-center gap-2">
                      <Button
                        onClick={handlePreviousWeek}
                        variant="outline"
                        size="sm"
                        className="border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] bg-transparent px-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleToday}
                        variant="outline"
                        size="sm"
                        className="border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] bg-transparent text-xs px-3"
                      >
                        Hoy
                      </Button>
                      <Button
                        onClick={handleNextWeek}
                        variant="outline"
                        size="sm"
                        className="border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] bg-transparent px-2"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Desktop action buttons */}
                    <div className="hidden md:flex gap-2">
                      {permissions.canCreateReservations && (
                      <Button
                          onClick={() => setIsAppointmentModalOpen(true)}
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white hover:from-[#9890E8] hover:to-[#7A6FD8] shadow-lg border-0"
                      >
                        <Plus className="w-4 h-4" />
                        Crear Reserva
                      </Button>
                      )}
                      {permissions.canEditBusinessHours && (
                      <Button
                        onClick={() => setIsBusinessHoursModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="gap-2 border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] bg-transparent"
                      >
                        <CalendarClock className="w-4 h-4" />
                        Horarios
                      </Button>
                      )}
                      {permissions.canEditStaff && (
                      <Button
                        onClick={() => setIsStaffModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="gap-2 border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] bg-transparent"
                      >
                        <UserPlus className="w-4 h-4" />
                        Personal
                      </Button>
                      )}
                      {permissions.canEditConfig && (
                      <Button
                        onClick={handleConnectGoogleCalendar}
                        variant="outline"
                        size="sm"
                        className="gap-2 border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] bg-transparent"
                      >
                        <Calendar className="w-4 h-4" />
                        Google Calendar
                      </Button>
                      )}
                    </div>

                    {/* Mobile action buttons - icon only */}
                    <div className="flex md:hidden gap-2">
                      {permissions.canCreateReservations && (
                      <Button
                          onClick={() => setIsAppointmentModalOpen(true)}
                        size="sm"
                        className="bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white hover:from-[#9890E8] hover:to-[#7A6FD8] shadow-lg border-0 px-2"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      )}
                      {permissions.canEditBusinessHours && (
                      <Button
                        onClick={() => setIsBusinessHoursModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] bg-transparent px-2"
                      >
                        <CalendarClock className="w-4 h-4" />
                      </Button>
                      )}
                      {permissions.canEditStaff && (
                      <Button
                        onClick={() => setIsStaffModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] bg-transparent px-2"
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                      )}
                    </div>
                  </div>
                </div>

                {calendarView === "day" && crmStore.isLoaded ? (
                  <DailyCalendarView
                    appointments={crmStore.data.appointments}
                    staff={crmStore.data.staff}
                    selectedDate={currentDate}
                    onDateChange={setCurrentDate}
                  />
                ) : (
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                  {/* Desktop week view */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-8 border-b-2 border-gray-200">
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-r border-gray-200">
                        <p className="text-sm font-bold text-[#2C293F]">Hora</p>
                      </div>
                      {weekDays.map((day) => (
                        <div
                          key={day.date}
                          className="p-4 bg-gradient-to-br from-purple-50 to-gray-50 border-r border-gray-200 last:border-r-0 text-center"
                        >
                          <p className="text-sm font-bold text-[#2C293F]">{day.day}</p>
                          <p className="text-xs text-[#AFA1FD] font-semibold">{day.date}</p>
                        </div>
                      ))}
                    </div>

                    <div className="overflow-x-auto">
                      <div className="min-w-[900px]">
                        {timeSlots.map((time) => (
                          <div
                            key={time}
                            className="grid grid-cols-8 border-b border-gray-100 last:border-b-0 hover:bg-purple-50/30 transition-colors"
                          >
                            <div className="p-4 border-r border-gray-200 bg-gray-50/50">
                              <p className="text-sm font-semibold text-gray-700">{time}</p>
                            </div>
                            {weekDays.map((day, dayIndex) => {
                              const occupation = occupations.find((occ) => occ.day === dayIndex && occ.time === time)
                              const isBusinessOpen = businessHours[day.key]?.enabled
                              const hasContent =
                                occupation || visibleAppointments.some((apt) => apt.day === dayIndex && apt.time === time)

                              return (
                                <div
                                  key={`${day.date}-${time}`}
                                  onClick={() => {
                                    console.log("[v0] Cell clicked", {
                                      day: dayIndex,
                                      time,
                                      isBusinessOpen,
                                      hasContent,
                                    })
                                    if (!hasContent && isBusinessOpen) {
                                      handleCreateAppointment(dayIndex, time)
                                    }
                                  }}
                                  className={`p-4 border-r border-gray-100 last:border-r-0 min-h-[70px] transition-all relative group ${
                                    !hasContent && isBusinessOpen
                                      ? "cursor-pointer hover:bg-purple-50 hover:shadow-inner"
                                      : ""
                                  } ${!isBusinessOpen ? "bg-gray-50" : ""}`}
                                >
                                  {!hasContent && isBusinessOpen && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                      <div className="bg-[#AFA1FD] text-white rounded-full p-2 shadow-lg">
                                        <Plus className="w-5 h-5" />
                                      </div>
                                    </div>
                                  )}

                                  {visibleAppointments
                                    .filter((apt) => apt.day === dayIndex && apt.time === time)
                                    .map((apt) => (
                                      <div
                                        key={apt.id}
                                        onMouseEnter={() => apt.packId && setHoveredPackId(apt.packId)}
                                        onMouseLeave={() => setHoveredPackId(null)}
                                        className={`relative p-2 rounded-lg shadow-sm text-xs group transition-all ${
                                          apt.isPack
                                            ? hoveredPackId === apt.packId
                                              ? "bg-gradient-to-br from-[#8B7FE8] to-[#6B5FD8] ring-2 ring-[#AFA1FD] ring-offset-1 scale-105 z-10"
                                              : "bg-gradient-to-br from-[#9B8FF8] to-[#7B6FE8]"
                                            : "bg-gradient-to-br from-[#AFA1FD] to-[#8B7FE8]"
                                        } text-white`}
                                      >
                                        {apt.paymentStatus === "paid" && (
                                          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold shadow-md flex items-center gap-0.5">
                                            <DollarSign className="w-2.5 h-2.5" />
                                            Pagado
                                          </div>
                                        )}

                                        {apt.isPack && (
                                          <div className="absolute -top-1 -left-1 bg-[#191824] text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold shadow-md flex items-center gap-0.5">
                                            <Package className="w-2.5 h-2.5" />
                                            {apt.subServiceIndex}/{apt.totalSubServices}
                                          </div>
                                        )}

                                        {apt.isManual && !apt.isPack && apt.paymentStatus !== "paid" && (
                                          <div className="absolute -top-1 -right-1 bg-[#191824] text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold shadow-md">
                                            Manual
                                          </div>
                                        )}

                                        {permissions.canCreateReservations && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteAppointment(apt.id)
                                          }}
                                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs z-20"
                                        >
                                          ×
                                        </button>
                                        )}

                                        <div className="font-semibold truncate">{apt.client}</div>
                                        <div className="text-[10px] opacity-90 truncate">
                                          {apt.isPack ? `${apt.packName} - ${apt.service}` : apt.service}
                                        </div>
                                        <div className="text-[10px] opacity-75">{apt.staffMember}</div>

                                        {apt.isPack && hoveredPackId === apt.packId && (
                                          <div className="absolute left-full ml-2 top-0 bg-[#191824] text-white p-3 rounded-lg shadow-xl z-50 min-w-[200px] text-xs">
                                            <div className="flex items-center gap-1 mb-2 font-bold">
                                              <Package className="w-3 h-3" />
                                              Pack: {apt.packName}
                                            </div>
                                            <div className="text-[10px] opacity-75 mb-2">
                                              Servicio {apt.subServiceIndex} de {apt.totalSubServices}
                                            </div>
                                            {apt.paymentStatus === "paid" && (
                                              <div className="flex items-center gap-1 text-green-400 text-[10px]">
                                                <Check className="w-3 h-3" />
                                                Adelanto pagado: ${apt.montoPagado}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}

                                  {occupation && (
                                    <motion.div
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      className="relative group/occupation"
                                    >
                                      <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl p-3 text-sm font-semibold shadow-lg hover:shadow-xl transition-all border-2 border-gray-600">
                                        <div className="flex items-center gap-1 mb-1">
                                          <Lock className="w-3 h-3" />
                                          <p className="font-bold text-xs">OCUPADO</p>
                                        </div>
                                        <p className="text-sm">{occupation.title}</p>
                                        {occupation.staffMember && (
                                          <p className="text-xs opacity-75 mt-1">{occupation.staffMember}</p>
                                        )}
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteOccupation(occupation.id)
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs z-20"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </motion.div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="md:hidden">
                    {calendarView === "day" ? (
                      // Single day view for mobile
                      <div className="p-4">
                        <div className="text-center mb-4 pb-4 border-b-2 border-[#DFDBF1]">
                          <p className="text-lg font-bold text-[#2C293F]">{weekDays[0].day}</p>
                          <p className="text-sm text-[#AFA1FD] font-semibold">{weekDays[0].date}</p>
                        </div>

                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                          {timeSlots.map((time) => {
                            const dayIndex = 0
                            const occupation = occupations.find((occ) => occ.day === dayIndex && occ.time === time)
                            const dayAppointments = visibleAppointments.filter(
                              (apt) => apt.day === dayIndex && apt.time === time,
                            )
                            const isBusinessOpen = businessHours[weekDays[0].key]?.enabled
                            const hasContent = occupation || dayAppointments.length > 0

                            return (
                              <div
                                key={time}
                                onClick={() => {
                                  if (!hasContent && isBusinessOpen) {
                                    handleCreateAppointment(dayIndex, time)
                                  }
                                }}
                                className={`rounded-xl border-2 p-4 transition-all ${
                                  !hasContent && isBusinessOpen
                                    ? "border-[#DFDBF1]/50 bg-white hover:bg-purple-50 hover:border-[#AFA1FD] cursor-pointer"
                                    : "border-gray-200 bg-gray-50"
                                } ${!isBusinessOpen ? "opacity-50" : ""}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm font-bold text-[#2C293F]">{time}</p>
                                  {!hasContent && isBusinessOpen && <Plus className="w-5 h-5 text-[#AFA1FD]" />}
                                </div>

                                {dayAppointments.map((apt) => (
                                  <motion.div
                                    key={apt.id}
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    onTouchStart={() => apt.packId && setHoveredPackId(apt.packId)}
                                    onTouchEnd={() => setHoveredPackId(null)}
                                    className={`rounded-xl p-4 shadow-lg relative transition-all ${
                                      apt.isPack
                                        ? hoveredPackId === apt.packId
                                          ? "bg-gradient-to-br from-[#8B7FE8] to-[#6B5FD8] ring-2 ring-[#AFA1FD]"
                                          : "bg-gradient-to-br from-[#9B8FF8] to-[#7B6FE8]"
                                        : "bg-gradient-to-br from-[#AFA1FD] to-[#8B7FE8]"
                                    } text-white`}
                                  >
                                    {apt.isPack && (
                                      <div className="absolute top-2 left-2 bg-[#191824] text-white text-[10px] px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                                        <Package className="w-3 h-3" />
                                        Pack {apt.subServiceIndex}/{apt.totalSubServices}
                                      </div>
                                    )}

                                    {apt.isManual && !apt.isPack && apt.paymentStatus !== "paid" && (
                                      <div className="absolute top-2 right-2 bg-[#191824] text-white text-[10px] px-2 py-1 rounded-full font-semibold">
                                        Manual
                                      </div>
                                    )}

                                    <p className="font-bold text-base mb-1 mt-6">{apt.client}</p>
                                    <p className="text-sm opacity-90 mb-1">
                                      {apt.isPack ? (
                                        <>
                                          <span className="font-semibold">{apt.packName}</span>
                                          <br />
                                          <span className="text-xs">{apt.service}</span>
                                        </>
                                      ) : (
                                        apt.service
                                      )}
                                    </p>
                                    <p className="text-xs opacity-75">{apt.staffMember}</p>

                                    {permissions.canCreateReservations && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteAppointment(apt.id)
                                      }}
                                      className="absolute bottom-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                    >
                                      ×
                                    </button>
                                    )}
                                  </motion.div>
                                ))}

                                {occupation && (
                                  <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl p-4 shadow-lg relative"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <Lock className="w-4 h-4" />
                                      <p className="font-bold text-sm">OCUPADO</p>
                                    </div>
                                    <p className="text-base font-semibold">{occupation.title}</p>
                                    {occupation.staffMember && (
                                      <p className="text-sm opacity-75 mt-1">{occupation.staffMember}</p>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteOccupation(occupation.id)
                                      }}
                                      className="absolute bottom-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </motion.div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      // Week view for tablet - horizontal scroll
                      <div className="overflow-x-auto">
                        <div className="flex gap-4 p-4 min-w-max">
                          {weekDays.slice(0, 3).map((day, dayIndex) => (
                            <div key={day.date} className="flex-shrink-0 w-64">
                              <div className="text-center mb-3 pb-3 border-b-2 border-[#DFDBF1]">
                                <p className="text-base font-bold text-[#2C293F]">{day.day}</p>
                                <p className="text-xs text-[#AFA1FD] font-semibold">{day.date}</p>
                              </div>

                              <div className="space-y-2">
                                {timeSlots.map((time) => {
                                  const occupation = occupations.find(
                                    (occ) => occ.day === dayIndex && occ.time === time,
                                  )
                                  const dayAppointments = visibleAppointments.filter(
                                    (apt) => apt.day === dayIndex && apt.time === time,
                                  )
                                  const isBusinessOpen = businessHours[day.key]?.enabled
                                  const hasContent = occupation || dayAppointments.length > 0

                                  return (
                                    <div
                                      key={time}
                                      onClick={() => {
                                        if (!hasContent && isBusinessOpen) {
                                          handleCreateAppointment(dayIndex, time)
                                        }
                                      }}
                                      className={`rounded-lg border p-3 text-xs transition-all ${
                                        !hasContent && isBusinessOpen
                                          ? "border-[#DFDBF1]/50 bg-white hover:bg-purple-50 cursor-pointer"
                                          : "border-gray-200 bg-gray-50"
                                      }`}
                                    >
                                      <p className="font-semibold text-[#2C293F] mb-1">{time}</p>

                                      {dayAppointments.map((apt) => (
                                        <div
                                          key={apt.id}
                                          className="bg-gradient-to-br from-[#AFA1FD] to-[#8B7FE8] text-white rounded-lg p-2 text-[10px]"
                                        >
                                          <p className="font-bold">{apt.client}</p>
                                          <p className="opacity-90">{apt.service}</p>
                                        </div>
                                      ))}

                                      {occupation && (
                                        <div className="bg-gray-400 text-white rounded-lg p-2 text-[10px]">
                                          <p className="font-bold">{occupation.title}</p>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8]" />
                        <span className="text-gray-600">Cita confirmada</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] ring-2 ring-[#AFA1FD] ring-offset-1 scale-105 z-10" />
                        <span className="text-gray-600">Pack seleccionado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-gradient-to-r from-[#9B8FF8] to-[#7B6FE8]" />
                        <span className="text-gray-600">Pack de servicio</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-green-500" />
                        <span className="text-gray-600">Adelanto pagado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-gradient-to-r from-gray-400 to-gray-500 border-2 border-gray-600" />
                        <span className="text-gray-600">Ocupación manual</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-gray-100 border border-gray-300" />
                        <span className="text-gray-600">Horario cerrado</span>
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {permissions.canCreateReservations && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCreateAppointment(0, timeSlots[0])}
                  className="md:hidden fixed bottom-6 right-6 z-20 w-14 h-14 bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white rounded-full shadow-2xl flex items-center justify-center"
                >
                  <Plus className="w-6 h-6" />
                </motion.button>
                )}
              </motion.div>
            )}

            {/* Reservations View */}
            {currentView === "reservations" && (
              <motion.div
                key="reservations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8"
              >
                {user?.role === "staff" ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <ClipboardList className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#2C293F] mb-2">No tienes acceso a esta vista</h2>
                    <p className="text-gray-600">Como miembro del staff, solo puedes ver tu calendario personal.</p>
                  </div>
                ) : (
                  <>
                <div className="mb-8">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-[#2C293F] via-[#AFA1FD] to-[#2C293F] bg-clip-text text-transparent mb-3">
                    Reservas
                  </h1>
                  <p className="text-[#AFA1FD] text-lg font-medium">
                    Gestiona todas las reservas y el historial de tus clientes
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
                >
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="searchReservations" className="text-[#2C293F] font-semibold mb-2 block">
                        Buscar
                      </Label>
                      <Input
                        id="searchReservations"
                        placeholder="Buscar por nombre, email o teléfono..." // Updated placeholder
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-gray-300 focus:border-[#AFA1FD]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="statusFilter" className="text-[#2C293F] font-semibold mb-2 block">
                        Estado
                      </Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="border-gray-300 focus:border-[#AFA1FD]">
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="confirmed">Confirmadas</SelectItem>
                          <SelectItem value="completed">Completadas</SelectItem>
                          <SelectItem value="cancelled">Canceladas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="dateFilter" className="text-[#2C293F] font-semibold mb-2 block">
                        Fecha
                      </Label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="border-gray-300 focus:border-[#AFA1FD]">
                          <SelectValue placeholder="Todas las fechas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las fechas</SelectItem>
                          <SelectItem value="today">Hoy</SelectItem>
                          <SelectItem value="week">Última semana</SelectItem>
                          <SelectItem value="month">Último mes</SelectItem>
                          <SelectItem value="custom">Rango personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {dateFilter === "custom" && (
                      <>
                        <div>
                          <Label htmlFor="dateFrom" className="text-[#2C293F] font-semibold mb-2 block">
                            Desde
                          </Label>
                          <Input
                            id="dateFrom"
                            type="date"
                            value={customDateFrom}
                            onChange={(e) => setCustomDateFrom(e.target.value)}
                            className="border-gray-300 focus:border-[#AFA1FD]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dateTo" className="text-[#2C293F] font-semibold mb-2 block">
                            Hasta
                          </Label>
                          <Input
                            id="dateTo"
                            type="date"
                            value={customDateTo}
                            onChange={(e) => setCustomDateTo(e.target.value)}
                            className="border-gray-300 focus:border-[#AFA1FD]"
                            min={customDateFrom}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDateFilter("all")
                              setCustomDateFrom("")
                              setCustomDateTo("")
                            }}
                            className="w-full border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD]"
                          >
                            Limpiar
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>

                <div className="space-y-4">
                  {filteredReservations.map((reservation, index) => {
                    const loyalty = getLoyaltyLevel(reservation.totalReservations)
                    const statusConfig = getStatusConfig(reservation.status)
                    const isExpanded = expandedReservation === reservation.id

                    // Find corresponding appointment in CRM store to get inspiration images
                    const correspondingAppointment = crmStore.isLoaded
                      ? crmStore.data.appointments.find((apt) => {
                          // Match by customer phone, date, and time
                          const customer = crmStore.data.customers.find((c) => c.phone === reservation.clientPhone)
                          if (!customer) return false
                          
                          // Convert reservation date to match appointment date format (YYYY-MM-DD)
                          const resDate = reservation.date // Format: YYYY-MM-DD or DD/MM/YYYY
                          let normalizedResDate = resDate
                          
                          // Normalize dates for comparison
                          if (resDate.includes("/")) {
                            const [day, month, year] = resDate.split("/")
                            normalizedResDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
                          }
                          
                          // Convert time formats for comparison
                          let resTime = reservation.time // Format: "10:00 AM" or "HH:MM"
                          let normalizedResTime = resTime
                          
                          if (resTime.includes("AM") || resTime.includes("PM")) {
                            const [time, period] = resTime.split(" ")
                            const [hours, minutes] = time.split(":")
                            let hour24 = parseInt(hours)
                            if (period === "PM" && hour24 !== 12) hour24 += 12
                            if (period === "AM" && hour24 === 12) hour24 = 0
                            normalizedResTime = `${hour24.toString().padStart(2, "0")}:${minutes}`
                          }
                          
                          // Match by customer, date, time, and service
                          return (
                            apt.customerId === customer.id &&
                            apt.date === normalizedResDate &&
                            apt.startTime === normalizedResTime &&
                            apt.serviceName === reservation.service
                          )
                        })
                      : null

                    const hasInspirationImages = correspondingAppointment?.inspirationImages && correspondingAppointment.inspirationImages.length > 0

                    return (
                      <motion.div
                        key={reservation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                      >
                        <div
                          className="p-6 cursor-pointer"
                          onClick={() => setExpandedReservation(isExpanded ? null : reservation.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-[#2C293F]">{reservation.clientName}</h3>
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-semibold"
                                  style={{ backgroundColor: loyalty.bgColor, color: loyalty.color }}
                                >
                                  {loyalty.label}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-600">{reservation.clientEmail}</p>
                                <p className="text-sm text-gray-600">{reservation.clientPhone}</p>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-[#AFA1FD]" />
                                  <span className="text-gray-700">
                                    {reservation.date} • {reservation.time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Scissors className="w-4 h-4 text-[#AFA1FD]" />
                                  <span className="text-gray-700">{reservation.service}</span>
                                </div>
                                {hasInspirationImages && (
                                  <div className="flex items-center gap-1 text-[#AFA1FD]">
                                    <ImageIcon className="w-4 h-4" />
                                    <span className="text-xs font-semibold">
                                      {correspondingAppointment?.inspirationImages.length} foto{correspondingAppointment?.inspirationImages.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                )}
                                <span
                                  className="px-3 py-1 rounded-lg text-xs font-semibold"
                                  style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                                >
                                  {statusConfig.label}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {reservation.status === "confirmed" && permissions.canDeleteReservations && (
                                <>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCompleteReservation(reservation.id)
                                    }}
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                  >
                                    Completar
                                  </Button>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCancelReservation(reservation.id)
                                    }}
                                    size="sm"
                                    variant="outline"
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    Cancelar
                                  </Button>
                                </>
                              )}
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="ml-2"
                              >
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              </motion.div>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-gray-100 bg-gradient-to-br from-[#DFDBF1]/20 to-gray-50"
                            >
                              <div className="p-6">
                                <h4 className="text-lg font-bold text-[#2C293F] mb-4">Detalles del cliente</h4>

                                <div className="grid md:grid-cols-3 gap-6 mb-6">
                                  <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">Total de reservas</p>
                                    <p className="text-3xl font-bold text-[#AFA1FD]">{reservation.totalReservations}</p>
                                  </div>
                                  <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">Última visita</p>
                                    <p className="text-lg font-semibold text-[#2C293F]">{reservation.lastVisit}</p>
                                  </div>
                                  <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">Nivel de fidelización</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <div
                                        className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden"
                                        title={`Ha reservado ${reservation.totalReservations} veces anteriormente`}
                                      >
                                        <div
                                          className="h-full rounded-full transition-all"
                                          style={{
                                            width: `${Math.min((reservation.totalReservations / 5) * 100, 100)}%`,
                                            backgroundColor: loyalty.color,
                                          }}
                                        />
                                      </div>
                                      <span
                                        className="text-xs font-semibold px-2 py-1 rounded"
                                        style={{ backgroundColor: loyalty.bgColor, color: loyalty.color }}
                                      >
                                        {loyalty.label}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {reservation.history.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-[#2C293F] mb-3">Historial de reservas</h5>
                                    <div className="space-y-2">
                                      {reservation.history.map((item, idx) => {
                                        const historyStatus = getStatusConfig(item.status as "confirmed" | "completed" | "cancelled")
                                        
                                        // Find corresponding appointment in CRM store for this history item
                                        let historyAppointment = null
                                        let hasHistoryImages = false
                                        
                                        if (crmStore.isLoaded && crmStore.data) {
                                          // Find customer by phone (more reliable than ID)
                                          const customer = crmStore.data.customers.find((c) => c.phone === reservation.clientPhone)
                                          
                                          if (customer) {
                                            // Convert date format for comparison
                                            // History dates are in format "2023-10-15" (YYYY-MM-DD)
                                            let normalizedHistoryDate = item.date
                                            // If date is in DD/MM/YYYY format, convert it
                                            if (item.date.includes("/")) {
                                              const [day, month, year] = item.date.split("/")
                                              normalizedHistoryDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
                                            }
                                            // Ensure date is in YYYY-MM-DD format
                                            if (!normalizedHistoryDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                              // Try to parse and reformat
                                              try {
                                                const dateObj = new Date(normalizedHistoryDate)
                                                normalizedHistoryDate = dateObj.toISOString().split('T')[0]
                                              } catch (e) {
                                                // If parsing fails, use original date
                                                normalizedHistoryDate = item.date
                                              }
                                            }
                                            
                                            // Find matching appointment - try multiple matching strategies
                                            historyAppointment = crmStore.data.appointments.find((apt) => {
                                              // Match by customer ID and date
                                              const customerMatch = apt.customerId === customer.id
                                              const dateMatch = apt.date === normalizedHistoryDate
                                              
                                              // Match service name (case insensitive, trim whitespace)
                                              const serviceMatch = apt.serviceName?.trim().toLowerCase() === item.service?.trim().toLowerCase()
                                              
                                              return customerMatch && dateMatch && serviceMatch
                                            })
                                            
                                            // If not found, try without service name match (in case service name changed)
                                            if (!historyAppointment) {
                                              historyAppointment = crmStore.data.appointments.find((apt) => {
                                                const customerMatch = apt.customerId === customer.id
                                                const dateMatch = apt.date === normalizedHistoryDate
                                                return customerMatch && dateMatch
                                              })
                                            }
                                            
                                            // Check if appointment has images
                                            hasHistoryImages = !!(historyAppointment?.inspirationImages && 
                                                              Array.isArray(historyAppointment.inspirationImages) &&
                                                              historyAppointment.inspirationImages.length > 0)
                                          }
                                        }
                                        
                                        return (
                                          <div
                                            key={idx}
                                            className="p-3 bg-white rounded-lg text-sm"
                                          >
                                            <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className="w-2 h-2 rounded-full bg-[#AFA1FD]" />
                                              <span className="text-gray-700">{item.date}</span>
                                              <span className="text-gray-500">•</span>
                                              <span className="text-gray-700">{item.service}</span>
                                                {hasHistoryImages && (
                                                  <div className="flex items-center gap-1 text-[#AFA1FD]">
                                                    <ImageIcon className="w-4 h-4" />
                                                    <span className="text-xs font-semibold">
                                                      {historyAppointment?.inspirationImages.length} foto{historyAppointment?.inspirationImages.length !== 1 ? 's' : ''}
                                                    </span>
                                                  </div>
                                                )}
                                            </div>
                                            <span
                                              className="px-2 py-1 rounded text-xs font-semibold"
                                              style={{
                                                backgroundColor: historyStatus.bgColor,
                                                color: historyStatus.color,
                                              }}
                                            >
                                              {historyStatus.label}
                                            </span>
                                            </div>
                                            
                                            {/* Show images for this history item if they exist */}
                                            {hasHistoryImages && historyAppointment && (
                                              <div className="mt-3 pt-3 border-t border-gray-100">
                                                <div className="grid grid-cols-3 gap-2">
                                                  {historyAppointment.inspirationImages.map((image, imgIdx) => (
                                                    <motion.div
                                                      key={imgIdx}
                                                      initial={{ opacity: 0, scale: 0.9 }}
                                                      animate={{ opacity: 1, scale: 1 }}
                                                      transition={{ delay: imgIdx * 0.05 }}
                                                      className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-[#AFA1FD] transition-all cursor-pointer"
                                                      onClick={() => {
                                                        const newWindow = window.open()
                                                        if (newWindow) {
                                                          newWindow.document.write(`
                                                            <html>
                                                              <head><title>${image.name}</title></head>
                                                              <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
                                                                <img src="${image.dataUrl}" style="max-width:100%;max-height:100vh;object-fit:contain;" alt="${image.name}" />
                                                              </body>
                                                            </html>
                                                          `)
                                                        }
                                                      }}
                                                    >
                                                      <img
                                                        src={image.dataUrl}
                                                        alt={image.name}
                                                        className="w-full h-full object-cover"
                                                      />
                                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                        <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center">
                                                          {image.name}
                                                        </p>
                                                      </div>
                                                    </motion.div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Inspiration Images Section */}
                                {hasInspirationImages && correspondingAppointment && (
                                  <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="text-lg font-bold text-[#2C293F] mb-4 flex items-center gap-2">
                                      <ImageIcon className="w-5 h-5 text-[#AFA1FD]" />
                                      Fotos de inspiración ({correspondingAppointment.inspirationImages.length})
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                      {correspondingAppointment.inspirationImages.map((image, imgIdx) => (
                                        <motion.div
                                          key={imgIdx}
                                          initial={{ opacity: 0, scale: 0.9 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ delay: imgIdx * 0.1 }}
                                          className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#AFA1FD] transition-all cursor-pointer"
                                          onClick={() => {
                                            // Open image in new tab/window for full view
                                            const newWindow = window.open()
                                            if (newWindow) {
                                              newWindow.document.write(`
                                                <html>
                                                  <head><title>${image.name}</title></head>
                                                  <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
                                                    <img src="${image.dataUrl}" style="max-width:100%;max-height:100vh;object-fit:contain;" alt="${image.name}" />
                                                  </body>
                                                </html>
                                              `)
                                            }
                                          }}
                                        >
                                          <img
                                            src={image.dataUrl}
                                            alt={image.name}
                                            className="w-full h-full object-cover"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center">
                                              {image.name}
                                            </p>
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3">
                                      Haz clic en una imagen para verla en tamaño completo
                                    </p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 p-6 rounded-xl text-center"
                  style={{ backgroundColor: "#DFDBF1" + "33" }}
                >
                  <p className="text-lg font-semibold text-[#2C293F]">
                    Total de reservas: <span className="text-[#AFA1FD]">{filteredReservations.length}</span>
                  </p>
                </motion.div>
                  </>
                )}
              </motion.div>
            )}

            {/* Customers View */}
            {currentView === "customers" && (
              <motion.div
                key="customers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8"
              >
                <div className="mb-8">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-[#2C293F] via-[#AFA1FD] to-[#2C293F] bg-clip-text text-transparent mb-3">
                    Clientes
                  </h1>
                  <p className="text-[#AFA1FD] text-lg font-medium">
                    Gestiona tus clientes y visualiza sus cumpleaños
                  </p>
                </div>

                {crmStore.isLoaded && (
                  <CustomersList
                    customers={crmStore.data.customers}
                    appointments={crmStore.data.appointments}
                  />
                )}
              </motion.div>
            )}

            {/* Configuration View */}
            {currentView === "config" && (
              <motion.div
                key="config"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8"
              >
                {user?.role === "staff" ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#2C293F] mb-2">No tienes acceso a esta vista</h2>
                    <p className="text-gray-600">Como miembro del staff, no puedes acceder a la configuración.</p>
                  </div>
                ) : (
                  <>
                <div className="mb-8">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-[#2C293F] via-[#AFA1FD] to-[#2C293F] bg-clip-text text-transparent mb-3">
                    Configuración
                  </h1>
                  <p className="text-[#AFA1FD] text-lg font-medium">Ajusta las preferencias de tu negocio</p>
                </div>

                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#DFDBF1] flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-[#AFA1FD]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#2C293F]">Información del Negocio</h2>
                        <p className="text-sm text-[#AFA1FD]">Edita los datos de tu salón</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="businessName" className="text-[#2C293F] font-semibold mb-2 block">
                          Nombre del negocio
                        </Label>
                        <Input
                          id="businessName"
                          value={businessInfo.name}
                          onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                          className="border-gray-300 focus:border-[#AFA1FD]"
                        />
                      </div>

                      <div>
                        <Label htmlFor="businessPhone" className="text-[#2C293F] font-semibold mb-2 block">
                          Teléfono
                        </Label>
                        <Input
                          id="businessPhone"
                          value={businessInfo.phone}
                          onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                          className="border-gray-300 focus:border-[#AFA1FD]"
                        />
                      </div>

                      <div>
                        <Label htmlFor="businessEmail" className="text-[#2C293F] font-semibold mb-2 block">
                          Email
                        </Label>
                        <Input
                          id="businessEmail"
                          type="email"
                          value={businessInfo.email}
                          onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                          className="border-gray-300 focus:border-[#AFA1FD]"
                        />
                      </div>

                      <div>
                        <Label htmlFor="businessAddress" className="text-[#2C293F] font-semibold mb-2 block">
                          Dirección
                        </Label>
                        <Input
                          id="businessAddress"
                          value={businessInfo.address}
                          onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                          className="border-gray-300 focus:border-[#AFA1FD]"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="logo"
                          className="text-[#2C293F] font-semibold mb-2 block flex items-center gap-2"
                        >
                          <ImageIcon className="w-5 h-5 text-[#AFA1FD]" />
                          Logo del negocio
                        </Label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-xl bg-[#DFDBF1] flex items-center justify-center overflow-hidden">
                            {businessInfo.logo ? (
                              <img
                                src={businessInfo.logo || "/placeholder.svg"}
                                alt="Logo"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-10 h-10 text-[#AFA1FD]" />
                            )}
                          </div>
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileChange}
                            className="hidden"
                          />
                          {permissions.canEditConfig && (
                          <Button
                            onClick={handleLogoUpload}
                            disabled={logoUploading}
                            variant="outline"
                            className="gap-2 border-gray-300 bg-transparent hover:border-[#AFA1FD] hover:text-[#AFA1FD]"
                          >
                            <Upload className="w-4 h-4" />
                            {logoUploading ? "Subiendo..." : "Subir logo"}
                          </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {permissions.canEditConfig && (
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={handleSaveBusinessInfo}
                        className="bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] hover:from-[#9890E8] hover:to-[#7A6FD8] text-white shadow-lg"
                      >
                        Guardar cambios
                      </Button>
                    </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#DFDBF1] flex items-center justify-center">
                        <LinkIcon className="w-6 h-6 text-[#AFA1FD]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#2C293F]">Link Público</h2>
                        <p className="text-sm text-[#AFA1FD]">Comparte este enlace con tus clientes</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="publicSlug" className="text-[#2C293F] font-semibold mb-2 block">
                          URL personalizada
                        </Label>
                        <div className="flex gap-2">
                          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                            <span className="text-gray-500">lila.app/</span>
                            <Input
                              id="publicSlug"
                              value={businessInfo.publicSlug}
                              onChange={(e) => setBusinessInfo({ ...businessInfo, publicSlug: e.target.value })}
                              disabled={!permissions.canEditConfig}
                              className="border-0 bg-transparent p-0 focus-visible:ring-0"
                            />
                          </div>
                          <Button
                            onClick={handleCopyLink}
                            variant="outline"
                            className="gap-2 border-gray-300 bg-transparent"
                          >
                            {copiedLink ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copiar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 bg-[#DFDBF1]/30 rounded-xl">
                        <p className="text-sm text-[#2C293F]">
                          <strong>Link completo:</strong> https://lila.app/{businessInfo.publicSlug}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#DFDBF1] flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-[#AFA1FD]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#2C293F]">Sincronización de Calendario</h2>
                        <p className="text-sm text-[#AFA1FD]">Conecta tu Google Calendar</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-[#2C293F] mb-1">Google Calendar</p>
                        <p className="text-sm text-gray-500">
                          {calendarConnected ? "Sincronización activa" : "Sincroniza automáticamente tus citas"}
                        </p>
                      </div>
                      {permissions.canEditConfig && (
                      <Button
                        onClick={handleConnectGoogleCalendar}
                        disabled={calendarConnected}
                        className={`gap-2 ${
                          calendarConnected
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] hover:from-[#9890E8] hover:to-[#7A6FD8]"
                        } text-white shadow-lg`}
                      >
                        {calendarConnected ? (
                          <>
                            <Check className="w-4 h-4" />
                            Conectado
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4" />
                            Conectar
                          </>
                        )}
                      </Button>
                      )}
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-900">
                        <strong>Nota:</strong> La sincronización bidireccional mantendrá tus citas actualizadas en ambas
                        plataformas.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#DFDBF1] flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-[#AFA1FD]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#2C293F]">Código QR</h2>
                        <p className="text-sm text-[#AFA1FD]">Genera un QR para tu recepción</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="flex-1">
                        <p className="text-[#2C293F] mb-4">
                          Genera un código QR que tus clientes pueden escanear para acceder directamente a tu página de
                          reservas.
                        </p>
                        {permissions.canEditConfig && (
                        <Button
                          onClick={handleGenerateQR}
                          className="bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] hover:from-[#9890E8] hover:to-[#7A6FD8] text-white gap-2 shadow-lg"
                        >
                          <QrCode className="w-4 h-4" />
                          {qrGenerated ? "Regenerar código QR" : "Generar código QR"}
                        </Button>
                        )}
                      </div>

                      <div
                        className={`w-48 h-48 rounded-xl flex items-center justify-center border-2 transition-all ${
                          qrGenerated
                            ? "bg-white border-[#AFA1FD] shadow-lg"
                            : "bg-gray-100 border-dashed border-gray-300"
                        }`}
                      >
                        {qrGenerated ? (
                          <div className="text-center">
                            <QrCode className="w-24 h-24 text-[#AFA1FD] mx-auto mb-2" />
                            <p className="text-xs text-gray-600">Código QR generado</p>
                          </div>
                        ) : (
                          <QrCode className="w-24 h-24 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-900">
                        <strong>Tip:</strong> Imprime este código QR y colócalo en tu recepción para que los clientes
                        puedan reservar fácilmente.
                      </p>
                    </div>
                  </motion.div>

                  {/* Staff Extra Minutes Configuration */}
                  {crmStore.isLoaded && permissions.canEditConfig && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                    >
                      <StaffExtraMinutesForm
                        staff={crmStore.data.staff}
                        onUpdate={(staff) => crmStore.upsertStaff(staff)}
                      />
                    </motion.div>
                  )}
                </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Dialog open={isBusinessHoursModalOpen} onOpenChange={setIsBusinessHoursModalOpen}>
            <DialogContent className="sm:max-w-[700px] bg-white max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#2C293F]">Horarios de Atención</DialogTitle>
                <DialogDescription className="text-[#AFA1FD]">
                  Define los horarios en que tu negocio está abierto
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {Object.entries(businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <p className="font-semibold text-[#2C293F] capitalize">{day}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="time"
                        value={hours.start}
                        onChange={(e) =>
                          setBusinessHours({
                            ...businessHours,
                            [day]: { ...hours, start: e.target.value },
                          })
                        }
                        disabled={!hours.enabled || !permissions.canEditBusinessHours}
                        className="w-32"
                      />
                      <span className="text-gray-500">-</span>
                      <Input
                        type="time"
                        value={hours.end}
                        onChange={(e) =>
                          setBusinessHours({
                            ...businessHours,
                            [day]: { ...hours, end: e.target.value },
                          })
                        }
                        disabled={!hours.enabled || !permissions.canEditBusinessHours}
                        className="w-32"
                      />
                      <Switch
                        checked={hours.enabled}
                        onCheckedChange={(checked) =>
                          setBusinessHours({
                            ...businessHours,
                            [day]: { ...hours, enabled: checked },
                          })
                        }
                        disabled={!permissions.canEditBusinessHours}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsBusinessHoursModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => setIsBusinessHoursModalOpen(false)}
                  className="bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white"
                >
                  Guardar horarios
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
            <DialogContent className="sm:max-w-[700px] bg-white max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#2C293F]">Gestión de Personal</DialogTitle>
                <DialogDescription className="text-[#AFA1FD]">
                  Administra los miembros de tu equipo y sus horarios
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Add new staff member */}
                {permissions.canEditStaff && (
                <div className="p-4 bg-purple-50 rounded-xl border-2 border-dashed border-[#AFA1FD]">
                  <h3 className="font-semibold text-[#2C293F] mb-4">Agregar nuevo miembro</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Nombre completo"
                      value={newStaffMember.name}
                      onChange={(e) => setNewStaffMember({ ...newStaffMember, name: e.target.value })}
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={newStaffMember.email}
                      onChange={(e) => setNewStaffMember({ ...newStaffMember, email: e.target.value })}
                    />
                    <div className="flex items-center gap-2">
                      <Label>Color:</Label>
                      <Input
                        type="color"
                        value={newStaffMember.color}
                        onChange={(e) => setNewStaffMember({ ...newStaffMember, color: e.target.value })}
                        className="w-20 h-10"
                      />
                    </div>
                    <Button onClick={handleAddStaffMember} className="bg-[#AFA1FD] text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>
                )}

                {/* List of staff members */}
                <div className="space-y-3">
                  {staffMembers.map((staff) => (
                    <div key={staff.id} className="p-4 bg-white border border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: staff.color }}
                          >
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#2C293F]">{staff.name}</p>
                            <p className="text-sm text-gray-500">{staff.email}</p>
                          </div>
                        </div>
                        {permissions.canEditStaff && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStaffMembers(staffMembers.filter((s) => s.id !== staff.id))}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Eliminar
                        </Button>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-[#2C293F] mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Duraciones personalizadas
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {services.map((service) => {
                            const customDuration = staff.customDurations?.[service.id]
                            return (
                              <div
                                key={service.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                              >
                                <span className="text-sm text-gray-700">{service.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    Default: {service.duration} min
                                  </span>
                                  <Input
                                    type="number"
                                    placeholder={String(service.duration)}
                                    value={customDuration !== undefined ? String(customDuration) : ""}
                                    onChange={(e) => {
                                      if (!permissions.canEditStaff) return
                                      const newDuration = e.target.value ? parseInt(e.target.value) : undefined
                                      setStaffMembers(
                                        staffMembers.map((s) =>
                                          s.id === staff.id
                                            ? {
                                                ...s,
                                                customDurations: {
                                                  ...s.customDurations,
                                                  [service.id]:
                                                    newDuration !== undefined && !isNaN(newDuration)
                                                      ? newDuration
                                                      : service.duration, // Use default if input is invalid or empty
                                                },
                                              }
                                            : s
                                        )
                                      )
                                    }}
                                    disabled={!permissions.canEditStaff}
                                    className="w-20 h-8 text-sm"
                                    min="5"
                                    step="5"
                                  />
                                  {customDuration !== undefined &&
                                    customDuration !== service.duration && (
                                      <span className="px-2 py-1 bg-[#AFA1FD] text-white text-xs rounded-full">
                                        {customDuration} min
                                      </span>
                                    )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setIsStaffModalOpen(false)} className="bg-[#AFA1FD] text-white">
                  Cerrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
            <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#2C293F]">
                  {entryType === "appointment" ? "Crear reserva manual" : "Nueva Ocupación"}
                </DialogTitle>
                <DialogDescription className="text-[#AFA1FD]">
                  {selectedTimeSlot &&
                    `Crear ${entryType === "appointment" ? "reserva" : "ocupación"} para ${weekDays[selectedTimeSlot.day].day} ${weekDays[selectedTimeSlot.day].date}`}
                </DialogDescription>
              </DialogHeader>

              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setEntryType("appointment")}
                  className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                    entryType === "appointment"
                      ? "bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Cita con cliente
                </button>
                <button
                  onClick={() => setEntryType("occupation")}
                  className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                    entryType === "occupation"
                      ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Ocupación manual
                </button>
              </div>

              <div className="space-y-4 py-4">
                {entryType === "appointment" ? (
                  <>
                    <div>
                      <Label htmlFor="clientName" className="text-[#2C293F] font-semibold mb-2 block">
                        Nombre del cliente *
                      </Label>
                      <Input
                        id="clientName"
                        value={newAppointment.client}
                        onChange={(e) => setNewAppointment({ ...newAppointment, client: e.target.value })}
                        placeholder="Ej: Ana García"
                        className="border-gray-300 focus:border-[#AFA1FD]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientEmail" className="text-[#2C293F] font-semibold mb-2 block">
                        Email *
                      </Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={newAppointment.clientEmail}
                        onChange={(e) => setNewAppointment({ ...newAppointment, clientEmail: e.target.value })}
                        placeholder="cliente@ejemplo.com"
                        className="border-gray-300 focus:border-[#AFA1FD]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientPhone" className="text-[#2C293F] font-semibold mb-2 block">
                        Teléfono (opcional)
                      </Label>
                      <Input
                        id="clientPhone"
                        type="tel"
                        value={newAppointment.clientPhone}
                        onChange={(e) => setNewAppointment({ ...newAppointment, clientPhone: e.target.value })}
                        placeholder="+1 234 567 8900"
                        className="border-gray-300 focus:border-[#AFA1FD]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="appointmentDate" className="text-[#2C293F] font-semibold mb-2 block">
                          Fecha *
                        </Label>
                        <Input
                          id="appointmentDate"
                          type="date"
                          value={newAppointment.date}
                          onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                          className="border-gray-300 focus:border-[#AFA1FD]"
                        />
                      </div>

                      <div>
                        <Label htmlFor="appointmentTime" className="text-[#2C293F] font-semibold mb-2 block">
                          Hora *
                        </Label>
                        <Input
                          id="appointmentTime"
                          type="time"
                          value={newAppointment.time}
                          onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                          className="border-gray-300 focus:border-[#AFA1FD]"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="appointmentService" className="text-[#2C293F] font-semibold mb-2 block">
                        Servicio *
                      </Label>
                      <Select
                        value={newAppointment.service}
                        onValueChange={(value) => {
                          const selectedService = services.find((s) => s.name === value)
                          setNewAppointment({
                            ...newAppointment,
                            service: value,
                            duration: selectedService?.duration || 30,
                          })
                        }}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-[#AFA1FD]">
                          <SelectValue placeholder="Selecciona un servicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.name}>
                              {service.name} - {service.duration} min - ${service.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="appointmentDuration" className="text-[#2C293F] font-semibold mb-2 block">
                        Duración (minutos)
                      </Label>
                      <Input
                        id="appointmentDuration"
                        type="number"
                        value={newAppointment.duration}
                        onChange={(e) =>
                          setNewAppointment({ ...newAppointment, duration: Number.parseInt(e.target.value) || 30 })
                        }
                        placeholder="30"
                        min="15"
                        step="15"
                        className="border-gray-300 focus:border-[#AFA1FD]"
                      />
                    </div>

                    {newAppointment.service &&
                      services.find((s) => s.name === newAppointment.service)?.requiereAdelanto && (
                        <div className="bg-[#DFDBF1] p-4 rounded-lg space-y-3">
                          <p className="text-sm text-[#191824] font-medium">
                            Este servicio requiere un adelanto de $
                            {services.find((s) => s.name === newAppointment.service)?.montoAdelanto}
                          </p>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="adelantoPagado"
                              checked={newAppointment.adelantoPagado}
                              onChange={(e) =>
                                setNewAppointment({ ...newAppointment, adelantoPagado: e.target.checked })
                              }
                              className="w-4 h-4 text-[#AFA1FD] border-gray-300 rounded focus:ring-[#AFA1FD]"
                            />
                            <Label htmlFor="adelantoPagado" className="text-sm text-[#191824] cursor-pointer">
                              Adelanto pagado
                            </Label>
                          </div>
                        </div>
                      )}

                    <div>
                      <Label htmlFor="appointmentStaff" className="text-[#2C293F] font-semibold mb-2 block">
                        Personal asignado (opcional)
                      </Label>
                      <Select
                        value={newAppointment.staffMember}
                        onValueChange={(value) => setNewAppointment({ ...newAppointment, staffMember: value })}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-[#AFA1FD]">
                          <SelectValue placeholder="Selecciona un miembro del personal" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffMembers.map((staff) => (
                            <SelectItem key={staff.id} value={staff.name}>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: staff.color }} />
                                {staff.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="appointmentNotes" className="text-[#2C293F] font-semibold mb-2 block">
                        Notas (opcional)
                      </Label>
                      <Textarea
                        id="appointmentNotes"
                        value={newAppointment.notes}
                        onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                        placeholder="Notas adicionales sobre la cita..."
                        className="border-gray-300 focus:border-[#AFA1FD]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="occupationTitle" className="text-[#2C293F] font-semibold mb-2 block">
                        Título / Motivo
                      </Label>
                      <Input
                        id="occupationTitle"
                        value={newOccupation.title}
                        onChange={(e) => setNewOccupation({ ...newOccupation, title: e.target.value })}
                        placeholder="Ej: Reunión, Descanso, Capacitación"
                        className="border-gray-300 focus:border-gray-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="occupationDuration" className="text-[#2C293F] font-semibold mb-2 block">
                        Duración (minutos)
                      </Label>
                      <Input
                        id="occupationDuration"
                        type="number"
                        value={newOccupation.duration}
                        onChange={(e) =>
                          setNewOccupation({ ...newOccupation, duration: Number.parseInt(e.target.value) || 30 })
                        }
                        placeholder="30"
                        min="15"
                        step="15"
                        className="border-gray-300 focus:border-gray-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="occupationStaff" className="text-[#2C293F] font-semibold mb-2 block">
                        Personal asignado (opcional)
                      </Label>
                      <Select
                        value={newOccupation.staffMember}
                        onValueChange={(value) => setNewOccupation({ ...newOccupation, staffMember: value })}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-gray-500">
                          <SelectValue placeholder="Selecciona un miembro del personal" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffMembers.map((staff) => (
                            <SelectItem key={staff.id} value={staff.name}>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: staff.color }} />
                                {staff.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="occupationNotes" className="text-[#2C293F] font-semibold mb-2 block">
                        Notas (opcional)
                      </Label>
                      <Textarea
                        id="occupationNotes"
                        value={newOccupation.notes}
                        onChange={(e) => setNewOccupation({ ...newOccupation, notes: e.target.value })}
                        placeholder="Notas adicionales..."
                        className="border-gray-300 focus:border-gray-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsAppointmentModalOpen(false)}
                  className="border-[#DFDBF1] text-[#191824]"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveAppointment} className="bg-[#191824] hover:bg-[#2C293F] text-white">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Service Modal */}
          <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
            <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#2C293F]">
                  {editingServiceId ? "Editar servicio" : "Nuevo servicio"}
                </DialogTitle>
                <DialogDescription className="text-[#AFA1FD]">
                  {editingServiceId
                    ? "Modifica los detalles del servicio"
                    : "Completa la información del nuevo servicio"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div>
                  <Label htmlFor="serviceName" className="text-[#2C293F] font-semibold mb-2 block">
                    Nombre del servicio
                  </Label>
                  <Input
                    id="serviceName"
                    value={serviceFormData.name}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                    placeholder="Ej: Manicura Clásica"
                    className="border-gray-300 focus:border-[#AFA1FD]"
                  />
                </div>

                <div>
                  <Label htmlFor="serviceDescription" className="text-[#2C293F] font-semibold mb-2 block">
                    Descripción
                  </Label>
                  <Textarea
                    id="serviceDescription"
                    value={serviceFormData.description}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                    placeholder="Describe el servicio..."
                    className="border-gray-300 focus:border-[#AFA1FD] min-h-[100px]"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="serviceImage"
                    className="text-[#2C293F] font-semibold mb-2 block flex items-center gap-2"
                  >
                    <ImageIcon className="w-5 h-5 text-[#AFA1FD]" />
                    Imagen del servicio
                  </Label>
                  <div className="space-y-3">
                    {serviceFormData.image && (
                      <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200">
                        <img
                          src={serviceFormData.image || "/placeholder.svg"}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          onClick={() => setServiceFormData({ ...serviceFormData, image: "" })}
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Input
                        id="serviceImage"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleServiceImageChange}
                        className="border-gray-300 focus:border-[#AFA1FD]"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Formatos aceptados: JPG, PNG. Tamaño recomendado: 400x400px</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#AFA1FD]/10 to-[#DFDBF1]/20 rounded-xl border-2 border-[#AFA1FD]/30">
                  <div>
                    <Label htmlFor="esPack" className="text-[#2C293F] font-semibold flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#AFA1FD]" />
                      Este servicio es un pack
                    </Label>
                    <p className="text-sm text-gray-500">Combina múltiples servicios con diferentes profesionales</p>
                  </div>
                  <Switch
                    id="esPack"
                    checked={serviceFormData.esPack}
                    onCheckedChange={(checked) => {
                      setServiceFormData({ ...serviceFormData, esPack: checked })
                      if (!checked) {
                        setSubServices([])
                      }
                    }}
                  />
                </div>

                <AnimatePresence>
                  {serviceFormData.esPack && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 border-2 border-[#AFA1FD]/20 rounded-xl p-4 bg-gray-50"
                    >
                      <h3 className="text-lg font-bold text-[#2C293F] flex items-center gap-2">
                        <Layers className="w-5 h-5 text-[#AFA1FD]" />
                        Subservicios del pack
                      </h3>

                      {/* List of added sub-services */}
                      {subServices.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {subServices.map((sub, index) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-[#AFA1FD] bg-[#AFA1FD]/10 px-2 py-1 rounded">
                                    #{index + 1}
                                  </span>
                                  <span className="font-semibold text-[#2C293F]">{sub.nombre}</span>
                                  {sub.inicioDependiente && index > 0 && (
                                    <ArrowRight className="w-4 h-4 text-[#AFA1FD]" />
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mt-1 flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {sub.duracion} min
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {sub.personalName}
                                  </span>
                                  {sub.precioParcial > 0 && (
                                    <span className="flex items-center gap-1">
                                      <span className="text-xs font-semibold">S/. {sub.precioParcial}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSubService(sub.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new sub-service form */}
                      <div className="space-y-3 p-4 bg-white rounded-lg border-2 border-dashed border-[#AFA1FD]/30">
                        <h4 className="font-semibold text-[#2C293F] text-sm">Añadir subservicio</h4>

                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">Nombre del subservicio</Label>
                          <Input
                            value={newSubService.nombre}
                            onChange={(e) => setNewSubService({ ...newSubService, nombre: e.target.value })}
                            placeholder="Ej: Masaje relajante"
                            className="border-gray-300 focus:border-[#AFA1FD]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">Duración (min)</Label>
                            <Input
                              type="number"
                              value={newSubService.duracion}
                              onChange={(e) => setNewSubService({ ...newSubService, duracion: e.target.value })}
                              placeholder="60"
                              className="border-gray-300 focus:border-[#AFA1FD]"
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">Precio parcial (S/.)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={newSubService.precioParcial}
                              onChange={(e) => setNewSubService({ ...newSubService, precioParcial: e.target.value })}
                              placeholder="Opcional"
                              className="border-gray-300 focus:border-[#AFA1FD]"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">Especialista asignado</Label>
                          <Select
                            value={newSubService.personalId}
                            onValueChange={(value) => setNewSubService({ ...newSubService, personalId: value })}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-[#AFA1FD]">
                              <SelectValue placeholder="Selecciona un especialista" />
                            </SelectTrigger>
                            <SelectContent>
                              {staffMembers.map((staff) => (
                                <SelectItem key={staff.id} value={staff.id.toString()}>
                                  {staff.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            id="inicioDependiente"
                            checked={newSubService.inicioDependiente}
                            onCheckedChange={(checked) =>
                              setNewSubService({ ...newSubService, inicioDependiente: checked })
                            }
                          />
                          <Label htmlFor="inicioDependiente" className="text-xs text-gray-600">
                            Empieza inmediatamente después del anterior
                          </Label>
                        </div>

                        <Button
                          onClick={handleAddSubService}
                          className="w-full bg-[#AFA1FD] hover:bg-[#9890E8] text-white"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Añadir subservicio
                        </Button>
                      </div>

                      {subServices.length > 0 && (
                        <div className="p-3 bg-[#AFA1FD]/10 rounded-lg">
                          <p className="text-sm text-[#2C293F]">
                            <span className="font-semibold">Duración total estimada:</span>{" "}
                            {subServices.reduce((acc, sub) => acc + sub.duracion, 0)} minutos
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!serviceFormData.esPack && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serviceDuration" className="text-[#2C293F] font-semibold mb-2 block">
                        Duración (minutos)
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="serviceDuration"
                          type="number"
                          value={serviceFormData.duration}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, duration: e.target.value })}
                          placeholder="30"
                          className="border-gray-300 focus:border-[#AFA1FD] pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="servicePrice" className="text-[#2C293F] font-semibold mb-2 block">
                        Precio total (S/.)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">S/.</span>
                        <Input
                          id="servicePrice"
                          type="number"
                          step="0.01"
                          value={serviceFormData.price}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                          placeholder="35.00"
                          className="border-gray-300 focus:border-[#AFA1FD] pl-10"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {serviceFormData.esPack && (
                  <div>
                    <Label htmlFor="servicePrice" className="text-[#2C293F] font-semibold mb-2 block">
                      Precio total del pack (S/.)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">S/.</span>
                      <Input
                        id="servicePrice"
                        type="number"
                        step="0.01"
                        value={serviceFormData.price}
                        onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                        placeholder="120.00"
                        className="border-gray-300 focus:border-[#AFA1FD] pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Precio total del pack (puede ser diferente a la suma de precios parciales)
                    </p>
                  </div>
                )}

                <div className="border-t-2 border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-[#2C293F] mb-4">Configuración de Adelanto</h3>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                    <div>
                      <Label htmlFor="requiereAdelanto" className="text-[#2C293F] font-semibold">
                        Requiere adelanto
                      </Label>
                      <p className="text-sm text-gray-500">El cliente debe pagar un adelanto para confirmar</p>
                    </div>
                    <Switch
                      id="requiereAdelanto"
                      checked={serviceFormData.requiereAdelanto}
                      onCheckedChange={(checked) =>
                        setServiceFormData({
                          ...serviceFormData,
                          requiereAdelanto: checked,
                          metodoPago: checked ? "online" : "no-aplica",
                        })
                      }
                    />
                  </div>

                  <AnimatePresence>
                    {serviceFormData.requiereAdelanto && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="montoAdelanto" className="text-[#2C293F] font-semibold mb-2 block">
                            Monto del adelanto ($)
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">S/.</span>
                            <Input
                              id="montoAdelanto"
                              type="number"
                              step="0.01"
                              value={serviceFormData.montoAdelanto}
                              onChange={(e) =>
                                setServiceFormData({ ...serviceFormData, montoAdelanto: e.target.value })
                              }
                              placeholder="Ej. 15.00"
                              className="border-gray-300 focus:border-[#AFA1FD] pl-10"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Debe ser menor o igual al precio total</p>
                        </div>

                        <div>
                          <Label htmlFor="metodoPago" className="text-[#2C293F] font-semibold mb-2 block">
                            Método de cobro del adelanto
                          </Label>
                          <Select
                            value={serviceFormData.metodoPago}
                            onValueChange={(value: "online" | "transferencia" | "no-aplica") =>
                              setServiceFormData({ ...serviceFormData, metodoPago: value })
                            }
                          >
                            <SelectTrigger className="border-gray-300 focus:border-[#AFA1FD]">
                              <SelectValue placeholder="Selecciona un método" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="online">Pago online (Stripe o Culqi)</SelectItem>
                              <SelectItem value="transferencia">Transferencia manual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <Label htmlFor="servicePublic" className="text-[#2C293F] font-semibold">
                      Mostrar en público
                    </Label>
                    <p className="text-sm text-gray-500">Los clientes podrán ver y reservar este servicio</p>
                  </div>
                  <Switch
                    id="servicePublic"
                    checked={serviceFormData.showPublic}
                    onCheckedChange={(checked) => setServiceFormData({ ...serviceFormData, showPublic: checked })}
                  />
                </div>

                {/* Available Days Configuration */}
                <div className="border-t-2 border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#2C293F] flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#AFA1FD]" />
                        Días de atención
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Selecciona en qué días de la semana está disponible este servicio
                      </p>
                    </div>
                    <Switch
                      checked={serviceFormData.customDays}
                      onCheckedChange={(checked) => {
                        setServiceFormData({
                          ...serviceFormData,
                          customDays: checked,
                          availableDays: checked
                            ? serviceFormData.availableDays
                            : {
                                monday: true,
                                tuesday: true,
                                wednesday: true,
                                thursday: true,
                                friday: true,
                                saturday: true,
                                sunday: true,
                              },
                        })
                      }}
                    />
                  </div>

                  {serviceFormData.customDays && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4"
                    >
                      {[
                        { key: "monday", label: "Lunes" },
                        { key: "tuesday", label: "Martes" },
                        { key: "wednesday", label: "Miércoles" },
                        { key: "thursday", label: "Jueves" },
                        { key: "friday", label: "Viernes" },
                        { key: "saturday", label: "Sábado" },
                        { key: "sunday", label: "Domingo" },
                      ].map((day) => (
                        <div
                          key={day.key}
                          className="flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-[#AFA1FD] transition-colors cursor-pointer"
                          onClick={() => {
                            setServiceFormData({
                              ...serviceFormData,
                              availableDays: {
                                ...serviceFormData.availableDays,
                                [day.key]: !serviceFormData.availableDays[day.key as keyof typeof serviceFormData.availableDays],
                              },
                            })
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={serviceFormData.availableDays[day.key as keyof typeof serviceFormData.availableDays]}
                            onChange={() => {}}
                            className="w-4 h-4 text-[#AFA1FD] border-gray-300 rounded focus:ring-[#AFA1FD] cursor-pointer"
                          />
                          <Label className="text-sm font-medium text-[#2C293F] cursor-pointer">{day.label}</Label>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {!serviceFormData.customDays && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        El servicio estará disponible todos los días de la semana
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="border-gray-300 bg-transparent"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveService}
                  className="bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] hover:from-[#9890E8] hover:to-[#7A6FD8] text-white"
                >
                  {editingServiceId ? "Guardar cambios" : "Crear servicio"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
