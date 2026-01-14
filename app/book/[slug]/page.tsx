"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Check, Sparkles, ArrowLeft, ChevronDown, ChevronUp, Package, User, Layers, MapPin, Upload, X, ImageIcon } from 'lucide-react'
import Link from "next/link"
import { WhatsAppWidget } from "@/components/whatsapp-widget"
import { WhatsAppHelpButton } from "@/components/whatsapp-help-button"
import { BirthdateField } from "@/components/birthdate-field"
import { InspirationUploader } from "@/components/inspiration-uploader"
import { useCRMStore } from "@/lib/hooks/use-crm-store"
import { useServices } from "@/lib/hooks/use-services"
import { useBusinessInfo } from "@/lib/hooks/use-business-info"
import type { InspirationImage } from "@/lib/types/crm"

type BookingStep = "service" | "datetime" | "contact" | "confirm" | "success"

interface Location {
  id: number
  name: string
  address: string
  phone: string
}

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
  price: number
  duration: number
  showPublic: boolean
  esPack: boolean
  subservicios?: SubService[]
  image?: string
}

interface BookingData {
  service: Service | null
  date: string
  time: string
  location: Location | null // Added location field
  name: string
  email: string
  phone: string
  birthdate: string // Added birthdate field
  // Changed to use InspirationImage type
  inspirationImages: InspirationImage[]
  comments: string
  staffId?: string // Staff member ID if selected
}

interface BusinessInfo {
  name: string
  phone: string
  email: string
  address: string
  logo: string
  publicSlug: string
  brandColor: string
  locations?: Location[] // Added locations array
}

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
]

export default function PublicBookingPage({ params }: { params: { slug: string } }) {
  const crmStore = useCRMStore()
  const [step, setStep] = useState<BookingStep>("service")
  const [bookingData, setBookingData] = useState<BookingData>({
    service: null,
    date: "",
    time: "",
    location: null, // Initialize location
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    inspirationImages: [],
    comments: "",
  })
  const [brandColor, setBrandColor] = useState("#AFA1FD")
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [expandedPackId, setExpandedPackId] = useState<number | null>(null)
  const [locations, setLocations] = useState<Location[]>([
    { id: 1, name: "Sede Principal", address: "Av. Principal 123, Centro", phone: "+1 234 567 8900" },
    { id: 2, name: "Sede Norte", address: "Calle Norte 456, Zona Norte", phone: "+1 234 567 8901" },
    { id: 3, name: "Sede Sur", address: "Av. Sur 789, Zona Sur", phone: "+1 234 567 8902" },
  ])

  // Use Supabase hooks
  const { services: supabaseServices, isLoaded: servicesLoaded } = useServices()
  const { businessInfo: supabaseBusinessInfo, isLoaded: businessInfoLoaded } = useBusinessInfo()

  useEffect(() => {
    // Load from Supabase first, then fallback to localStorage
    if (businessInfoLoaded && supabaseBusinessInfo) {
      setBusinessInfo({
        name: supabaseBusinessInfo.name || "",
        phone: supabaseBusinessInfo.phone || "",
        email: supabaseBusinessInfo.email || "",
        address: supabaseBusinessInfo.address || "",
        logo: supabaseBusinessInfo.logo || "",
      })
      if (supabaseBusinessInfo.brandColor) {
        setBrandColor(supabaseBusinessInfo.brandColor)
      }
    } else if (businessInfoLoaded) {
      // Fallback to localStorage
      const savedColor = localStorage.getItem("lilaBrandColor")
      const savedBusinessInfo = localStorage.getItem("lilaBusinessInfo")
      if (savedColor) setBrandColor(savedColor)
      if (savedBusinessInfo) {
        const info = JSON.parse(savedBusinessInfo)
        setBusinessInfo(info)
        if (info.locations && info.locations.length > 0) {
          setLocations(info.locations)
        }
      }
    }
  }, [businessInfoLoaded, supabaseBusinessInfo])

  useEffect(() => {
    if (servicesLoaded && supabaseServices.length > 0) {
      setServices(supabaseServices.filter((s) => s.showPublic).map((s) => ({
        id: parseInt(s.id) || Date.now(),
        name: s.name,
        description: s.description,
        price: s.price,
        duration: s.duration,
        showPublic: s.showPublic,
        esPack: s.esPack,
        subservicios: s.subservicios,
        image: s.image,
      })))
    } else if (servicesLoaded) {
      // Fallback to localStorage
      const savedServices = localStorage.getItem("lilaServices")
      if (savedServices) {
        const allServices = JSON.parse(savedServices)
        setServices(allServices.filter((s: Service) => s.showPublic))
      }
    }
    // Also load locations from localStorage (will be migrated later)
    const savedLocations = localStorage.getItem("lilaLocations")
    if (savedLocations) {
      setLocations(JSON.parse(savedLocations))
    }
  }, [servicesLoaded, supabaseServices])

  const handleServiceSelect = (service: Service) => {
    setBookingData({ ...bookingData, service })
    setStep("datetime")
  }

  const handleDateTimeSelect = () => {
    if (bookingData.date && bookingData.time && bookingData.location) {
      setStep("contact")
    }
  }

  const handleContactSubmit = () => {
    if (bookingData.name && bookingData.email && bookingData.phone) {
      setStep("confirm")
    }
  }

  const handleConfirmBooking = async () => {
    if (!bookingData.service || !bookingData.date || !bookingData.time || !bookingData.name || !bookingData.phone) {
      return
    }

    try {
      // Upsert customer (will get UUID from Supabase)
      await crmStore.upsertCustomer({
        id: `temp_${Date.now()}`, // Temporary ID, will be replaced
        fullName: bookingData.name,
        phone: bookingData.phone,
        email: bookingData.email,
        birthdate: bookingData.birthdate || undefined,
      })

      // Get the customer ID after upsert (wait a bit for it to be saved)
      await new Promise(resolve => setTimeout(resolve, 200))
      const customer = crmStore.getCustomerByPhone(bookingData.phone)
      
      if (!customer || !customer.id) {
        throw new Error("No se pudo obtener el ID del cliente después de guardar")
      }
      
      const customerId = customer.id

      // Get base duration
      const baseDuration = bookingData.service.duration || 30

      // Convert time from "9:00 AM" to "09:00"
      const time24 = convertTo24Hour(bookingData.time)

      // Add appointment (will get UUID from Supabase)
      await crmStore.addAppointment({
        id: `temp_${Date.now()}`, // Temporary ID, will be replaced
        customerId,
        staffId: bookingData.staffId || undefined,
        serviceName: bookingData.service.name,
        date: bookingData.date,
        startTime: time24,
        baseDuration,
        inspirationImages: bookingData.inspirationImages,
        notes: bookingData.comments || undefined,
      })

      setStep("success")
    } catch (error) {
      console.error("Error saving booking:", error)
      alert("Hubo un error al guardar la reserva. Por favor intenta de nuevo.")
    }
  }

  // Helper function to convert 12-hour to 24-hour format
  const convertTo24Hour = (time12: string): string => {
    const [time, period] = time12.split(" ")
    const [hours, minutes] = time.split(":")
    let hour24 = parseInt(hours)
    if (period === "PM" && hour24 !== 12) hour24 += 12
    if (period === "AM" && hour24 === 12) hour24 = 0
    return `${hour24.toString().padStart(2, "0")}:${minutes}`
  }

  const handleBack = () => {
    const steps: BookingStep[] = ["service", "datetime", "contact", "confirm", "success"]
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  const getStepNumber = () => {
    const stepMap: Record<BookingStep, number> = {
      service: 1,
      datetime: 2,
      contact: 3,
      confirm: 4,
      success: 4,
    }
    return stepMap[step]
  }

  const getTotalPackDuration = (service: Service) => {
    if (!service.esPack || !service.subservicios) return service.duration
    return service.subservicios.reduce((total, sub) => total + sub.duracion, 0)
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Floating orbs with brand color */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: brandColor }}
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: brandColor }}
        />
      </div>

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {businessInfo?.logo ? (
                <img
                  src={businessInfo.logo || "/placeholder.svg"}
                  alt={businessInfo.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: brandColor }}
                >
                  {businessInfo?.name?.[0] || "L"}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{businessInfo?.name || "Mi Salón"}</h1>
                <p className="text-sm text-gray-600">Sistema de reservas</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="gap-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <AnimatePresence mode="wait">
          {/* Step Indicator */}
          {step !== "success" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-4 mb-16"
            >
              {[1, 2, 3, 4].map((num) => (
                <motion.div
                  key={num}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: num * 0.1 }}
                  className="relative"
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all shadow-lg ${
                      num === getStepNumber()
                        ? "text-white scale-110 ring-4 ring-opacity-30"
                        : num < getStepNumber()
                          ? "text-white"
                          : "bg-white border-2"
                    }`}
                    style={{
                      backgroundColor: num <= getStepNumber() ? brandColor : "white",
                      borderColor: num > getStepNumber() ? brandColor + "40" : "transparent",
                      color: num > getStepNumber() ? brandColor : "white",
                      ringColor: brandColor + "50",
                    }}
                  >
                    {num < getStepNumber() ? <Check className="w-7 h-7" /> : num}
                  </div>
                  {num < 4 && (
                    <div
                      className="absolute top-1/2 left-full w-8 h-1 -translate-y-1/2 transition-all"
                      style={{ backgroundColor: num < getStepNumber() ? brandColor : brandColor + "30" }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Service Selection */}
          {step === "service" && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-5xl font-bold text-gray-900 mb-4">Elige tu servicio</h2>
              <p className="text-xl mb-10" style={{ color: brandColor }}>
                Selecciona el servicio que deseas reservar
              </p>

              <div className="space-y-5 mb-10">
                {services.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No hay servicios disponibles en este momento</p>
                  </div>
                ) : (
                  services.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -3 }}
                      className={`bg-white rounded-3xl p-8 border-2 cursor-pointer transition-all shadow-lg hover:shadow-2xl group relative overflow-hidden ${
                        bookingData.service?.id === service.id ? "ring-4 ring-opacity-20" : "border-gray-200"
                      }`}
                      style={{
                        borderColor: bookingData.service?.id === service.id ? brandColor : "#e5e7eb",
                        ringColor: brandColor + "30",
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: `linear-gradient(to right, ${brandColor}10, transparent)` }}
                      />

                      {service.esPack && (
                        <div
                          className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1"
                          style={{ backgroundColor: brandColor }}
                        >
                          <Package className="w-3 h-3" />
                          Pack
                        </div>
                      )}

                      <div
                        className="flex justify-between items-start gap-6 relative"
                        onClick={() => !service.esPack && handleServiceSelect(service)}
                      >
                        {service.image && (
                          <img
                            src={service.image || "/placeholder.svg"}
                            alt={service.name}
                            className="w-32 h-32 rounded-2xl object-cover flex-shrink-0 border-2 border-gray-100 shadow-md"
                          />
                        )}

                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.name}</h3>
                          <p className="text-lg mb-4" style={{ color: brandColor }}>
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4 text-gray-500">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {service.esPack
                                  ? `${getTotalPackDuration(service)} min total`
                                  : `${service.duration} min`}
                              </span>
                            </div>
                            {service.esPack && service.subservicios && (
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                <span className="text-sm font-medium">{service.subservicios.length} servicios</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <p className="text-4xl font-bold" style={{ color: brandColor }}>
                            S/. {service.price}
                          </p>
                        </div>
                      </div>

                      {service.esPack && service.subservicios && (
                        <div className="mt-6 pt-6 border-t-2 border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedPackId(expandedPackId === service.id ? null : service.id)
                            }}
                            className="flex items-center justify-between w-full text-left"
                          >
                            <span className="font-semibold text-gray-700 flex items-center gap-2">
                              <Layers className="w-4 h-4" style={{ color: brandColor }} />
                              Servicios incluidos
                            </span>
                            {expandedPackId === service.id ? (
                              <ChevronUp className="w-5 h-5" style={{ color: brandColor }} />
                            ) : (
                              <ChevronDown className="w-5 h-5" style={{ color: brandColor }} />
                            )}
                          </button>

                          <AnimatePresence>
                            {expandedPackId === service.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 space-y-3 overflow-hidden"
                              >
                                {service.subservicios.map((sub, idx) => (
                                  <div
                                    key={sub.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span
                                          className="text-xs font-semibold px-2 py-1 rounded"
                                          style={{ backgroundColor: brandColor + "20", color: brandColor }}
                                        >
                                          #{idx + 1}
                                        </span>
                                        <span className="font-semibold text-gray-900">{sub.nombre}</span>
                                      </div>
                                      <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {sub.duracion} min
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          {sub.personalName}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <Button
                            onClick={() => handleServiceSelect(service)}
                            className="w-full mt-4 text-white shadow-md"
                            style={{ backgroundColor: brandColor }}
                          >
                            Seleccionar pack
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {services.length > 0 && !services.some((s) => s.esPack) && (
                <Button
                  onClick={() => bookingData.service && setStep("datetime")}
                  disabled={!bookingData.service}
                  className="w-full text-white disabled:opacity-50 shadow-lg text-lg py-6"
                  style={{ backgroundColor: brandColor }}
                >
                  Continuar
                </Button>
              )}
            </motion.div>
          )}

          {/* Date & Time Selection */}
          {step === "datetime" && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-5xl font-bold text-gray-900 mb-4">Lugar, fecha y hora</h2>
              <p className="text-xl mb-10" style={{ color: brandColor }}>
                {bookingData.service?.esPack
                  ? "Selecciona el local, fecha y hora de inicio para tu pack"
                  : "Selecciona dónde y cuándo deseas tu cita"}
              </p>

              {bookingData.service?.esPack && bookingData.service.subservicios && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-6 bg-white rounded-2xl border-2 shadow-lg"
                  style={{ borderColor: brandColor + "30" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5" style={{ color: brandColor }} />
                    <h3 className="font-bold text-lg text-gray-900">Pack: {bookingData.service.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Este pack incluye {bookingData.service.subservicios.length} servicios con una duración total de{" "}
                    {getTotalPackDuration(bookingData.service)} minutos.
                  </p>
                  <div className="space-y-2">
                    {bookingData.service.subservicios.map((sub, idx) => (
                      <div key={sub.id} className="flex items-center gap-2 text-sm">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: brandColor }}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-gray-700">{sub.nombre}</span>
                        <span className="text-gray-500">
                          ({sub.duracion} min con {sub.personalName})
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="mb-8">
                <Label className="text-gray-900 font-bold text-lg mb-4 block flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: brandColor }} />
                  Local
                </Label>
                <div className="grid grid-cols-1 gap-4">
                  {locations.map((location, index) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        onClick={() => setBookingData({ ...bookingData, location })}
                        variant="outline"
                        className={`w-full h-auto p-6 text-left transition-all shadow-sm ${
                          bookingData.location?.id === location.id
                            ? "border-transparent shadow-lg scale-[1.02]"
                            : "bg-white border-2 border-gray-300 hover:bg-gray-50"
                        }`}
                        style={{
                          backgroundColor: bookingData.location?.id === location.id ? brandColor + "10" : "white",
                          borderColor: bookingData.location?.id === location.id ? brandColor : "#d1d5db",
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              bookingData.location?.id === location.id ? "text-white" : ""
                            }`}
                            style={{
                              backgroundColor:
                                bookingData.location?.id === location.id ? brandColor : brandColor + "20",
                              color: bookingData.location?.id === location.id ? "white" : "#111827",
                            }}
                          >
                            <MapPin className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3
                              className="font-bold text-lg mb-1"
                              style={{
                                color: bookingData.location?.id === location.id ? brandColor : "#111827",
                              }}
                            >
                              {location.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-1">{location.address}</p>
                            <p className="text-sm text-gray-500">{location.phone}</p>
                          </div>
                          {bookingData.location?.id === location.id && (
                            <Check className="w-6 h-6 flex-shrink-0" style={{ color: brandColor }} />
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <Label htmlFor="date" className="text-gray-900 font-bold text-lg mb-3 block flex items-center gap-2">
                  <Calendar className="w-5 h-5" style={{ color: brandColor }} />
                  Fecha
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  className="bg-white border-2 border-gray-300 rounded-2xl text-lg py-6 shadow-sm"
                  style={{ focusBorderColor: brandColor }}
                />
              </div>

              <div className="mb-10">
                <Label className="text-gray-900 font-bold text-lg mb-4 block flex items-center gap-2">
                  <Clock className="w-5 h-5" style={{ color: brandColor }} />
                  Hora {bookingData.service?.esPack && "de inicio"}
                </Label>
                <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto p-3 bg-gray-50 rounded-2xl">
                  {timeSlots.map((time, index) => (
                    <motion.div
                      key={time}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Button
                        onClick={() => setBookingData({ ...bookingData, time })}
                        variant="outline"
                        className={`w-full transition-all shadow-sm ${
                          bookingData.time === time
                            ? "text-white border-transparent shadow-lg scale-105"
                            : "bg-white border-gray-300 hover:bg-gray-50"
                        }`}
                        style={{
                          backgroundColor: bookingData.time === time ? brandColor : "white",
                          color: bookingData.time === time ? "white" : brandColor,
                          borderColor: bookingData.time === time ? brandColor : "#d1d5db",
                        }}
                      >
                        {time}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 text-gray-900 bg-white hover:bg-gray-50 text-lg py-6"
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleDateTimeSelect}
                  disabled={!bookingData.date || !bookingData.time || !bookingData.location}
                  className="flex-1 text-white disabled:opacity-50 shadow-lg text-lg py-6"
                  style={{ backgroundColor: brandColor }}
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Contact Information */}
          {step === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-5xl font-bold text-gray-900 mb-4">Información de contacto</h2>
              <p className="text-xl mb-10" style={{ color: brandColor }}>
                Necesitamos tus datos para confirmar la cita
              </p>

              <div className="space-y-7 mb-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Label htmlFor="name" className="text-gray-900 font-bold text-lg mb-3 block">
                    Nombre completo
                  </Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre"
                    value={bookingData.name}
                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                    className="bg-white border-2 border-gray-300 rounded-2xl text-lg py-6 shadow-sm"
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Label htmlFor="email" className="text-gray-900 font-bold text-lg mb-3 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    className="bg-white border-2 border-gray-300 rounded-2xl text-lg py-6 shadow-sm"
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Label htmlFor="phone" className="text-gray-900 font-bold text-lg mb-3 block">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    className="bg-white border-2 border-gray-300 rounded-2xl text-lg py-6 shadow-sm"
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <BirthdateField
                    value={bookingData.birthdate}
                    onChange={(value) => setBookingData({ ...bookingData, birthdate: value })}
                    label="Fecha de nacimiento (opcional)"
                    className="mb-7"
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <InspirationUploader
                    images={bookingData.inspirationImages}
                    onChange={(images) => setBookingData({ ...bookingData, inspirationImages: images })}
                    maxImages={3}
                    label="Fotos de inspiración (opcional)"
                    className="mb-7"
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <Label htmlFor="comments" className="text-gray-900 font-bold text-lg mb-3 block">
                    Comentarios o solicitudes especiales (opcional)
                  </Label>
                  <textarea
                    id="comments"
                    placeholder="Ej: Tengo alergia a ciertos productos, prefiero colores pastel, etc."
                    value={bookingData.comments}
                    onChange={(e) => setBookingData({ ...bookingData, comments: e.target.value })}
                    className="w-full bg-white border-2 border-gray-300 rounded-2xl text-lg p-4 shadow-sm min-h-[120px] resize-none focus:outline-none focus:border-opacity-100 transition-colors"
                    style={{ borderColor: '#d1d5db', focusBorderColor: brandColor }}
                    rows={4}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Comparte cualquier detalle importante sobre tu cita
                  </p>
                </motion.div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 text-gray-900 bg-white hover:bg-gray-50 text-lg py-6"
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleContactSubmit}
                  disabled={!bookingData.name || !bookingData.email || !bookingData.phone}
                  className="flex-1 text-white disabled:opacity-50 shadow-lg text-lg py-6"
                  style={{ backgroundColor: brandColor }}
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Confirmation */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-5xl font-bold text-gray-900 mb-4">Confirma tu cita</h2>
              <p className="text-xl mb-10" style={{ color: brandColor }}>
                Revisa los detalles antes de confirmar
              </p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-10 mb-10 space-y-6 shadow-xl border border-gray-100"
              >
                <div
                  className="flex justify-between items-center pb-6 border-b-2"
                  style={{ borderColor: brandColor + "20" }}
                >
                  <span className="font-semibold text-lg" style={{ color: brandColor }}>
                    Servicio:
                  </span>
                  <span className="text-gray-900 font-bold text-xl">{bookingData.service?.name}</span>
                </div>

                {bookingData.service?.esPack && bookingData.service.subservicios && (
                  <div className="pb-6 border-b-2" style={{ borderColor: brandColor + "20" }}>
                    <span className="font-semibold text-lg mb-3 block" style={{ color: brandColor }}>
                      Servicios incluidos:
                    </span>
                    <div className="space-y-2">
                      {bookingData.service.subservicios.map((sub, idx) => (
                        <div key={sub.id} className="flex items-center gap-2 text-gray-700">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: brandColor }}
                          >
                            {idx + 1}
                          </span>
                          <span>
                            {sub.nombre} ({sub.duracion} min con {sub.personalName})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className="flex justify-between items-start pb-6 border-b-2"
                  style={{ borderColor: brandColor + "20" }}
                >
                  <span className="font-semibold text-lg" style={{ color: brandColor }}>
                    Local:
                  </span>
                  <div className="text-right">
                    <p className="text-gray-900 font-bold text-xl">{bookingData.location?.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{bookingData.location?.address}</p>
                  </div>
                </div>

                <div
                  className="flex justify-between items-center pb-6 border-b-2"
                  style={{ borderColor: brandColor + "20" }}
                >
                  <span className="font-semibold text-lg" style={{ color: brandColor }}>
                    Fecha:
                  </span>
                  <span className="text-gray-900 font-bold text-xl">{bookingData.date}</span>
                </div>
                <div
                  className="flex justify-between items-center pb-6 border-b-2"
                  style={{ borderColor: brandColor + "20" }}
                >
                  <span className="font-semibold text-lg" style={{ color: brandColor }}>
                    Hora:
                  </span>
                  <span className="text-gray-900 font-bold text-xl">{bookingData.time}</span>
                </div>
                <div
                  className={`flex justify-between items-center ${bookingData.comments || bookingData.inspirationImagePreviews.length > 0 ? 'pb-6 border-b-2' : ''}`}
                  style={{ borderColor: brandColor + "20" }}
                >
                  <span className="font-semibold text-lg" style={{ color: brandColor }}>
                    Nombre:
                  </span>
                  <span className="text-gray-900 font-bold text-xl">{bookingData.name}</span>
                </div>

                {bookingData.inspirationImages.length > 0 && (
                  <div className={`pt-6 ${bookingData.comments ? 'pb-6 border-b-2' : ''}`} style={{ borderColor: brandColor + "20" }}>
                    <span className="font-semibold text-lg mb-3 block" style={{ color: brandColor }}>
                      Imágenes de inspiración:
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      {bookingData.inspirationImages.map((image, index) => (
                        <img
                          key={index}
                          src={image.dataUrl}
                          alt={image.name}
                          className="w-full aspect-square object-cover rounded-xl border-2 border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {bookingData.comments && (
                  <div className="pt-6">
                    <span className="font-semibold text-lg mb-3 block" style={{ color: brandColor }}>
                      Comentarios:
                    </span>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      {bookingData.comments}
                    </p>
                  </div>
                )}
              </motion.div>

              <div className="flex gap-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 text-gray-900 bg-white hover:bg-gray-50 text-lg py-6"
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  className="flex-1 text-white shadow-lg text-lg py-6"
                  style={{ backgroundColor: brandColor }}
                >
                  Confirmar reserva
                </Button>
              </div>
            </motion.div>
          )}

          {/* Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-32 h-32 mx-auto mb-8 relative"
              >
                <div
                  className="absolute inset-0 rounded-full blur-2xl opacity-20"
                  style={{ backgroundColor: brandColor }}
                />
                <Sparkles className="w-32 h-32 relative z-10" style={{ color: brandColor }} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-bold text-gray-900 mb-4"
              >
                {bookingData.service?.esPack ? "Pack reservado con éxito" : "Cita reservada con éxito"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl mb-12"
                style={{ color: brandColor }}
              >
                Hemos enviado una confirmación a tu email
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-3xl p-10 mb-10 max-w-md mx-auto shadow-xl border border-gray-100"
              >
                <p className="font-semibold text-lg mb-6" style={{ color: brandColor }}>
                  Resumen:
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-3">{bookingData.name}</p>
                <p className="text-lg font-semibold text-gray-700 mb-2">{bookingData.location?.name}</p>
                <p className="text-xl" style={{ color: brandColor }}>
                  {bookingData.date} a las {bookingData.time}
                </p>
                {bookingData.service?.esPack && (
                  <p className="text-sm text-gray-600 mt-4">
                    Duración total: {getTotalPackDuration(bookingData.service)} minutos
                  </p>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <Link href="/">
                  <Button className="text-white px-12 py-6 text-lg shadow-lg" style={{ backgroundColor: brandColor }}>
                    Volver al inicio
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <WhatsAppWidget 
        phoneNumber="+1234567890" 
        businessName="Lilá - Reservas"
      />
      <WhatsAppHelpButton variant="floating" />
    </div>
  )
}
