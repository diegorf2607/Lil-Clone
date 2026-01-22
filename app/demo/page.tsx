"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Calendar, Clock, MapPin, ArrowLeft, Upload, X, ImageIcon } from "lucide-react"
import { WhatsAppWidget } from "@/components/whatsapp-widget"
import { BirthdateField } from "@/components/birthdate-field"
import { InspirationUploader } from "@/components/inspiration-uploader"
import { useCRMStore } from "@/lib/hooks/use-crm-store"
import { useServices } from "@/lib/hooks/use-services"
import { useBusinessInfo } from "@/lib/hooks/use-business-info"
import { createClient } from "@/lib/supabase/client"
import type { InspirationImage } from "@/lib/types/crm"

type Step = "service" | "location" | "datetime" | "contact" | "confirmation"

interface Service {
  id: number
  name: string
  description: string
  price: number
  duration: number
  requiereAdelanto: boolean
  montoAdelanto: number
  metodoPago: "online" | "transferencia" | "no-aplica"
  availableDays?: { [key: string]: boolean }
  customDays?: boolean
}

interface BookingData {
  service: Service | null
  date: string
  time: string
  name: string
  email: string
  phone: string
}

interface BusinessHours {
  [key: string]: { start: string; end: string; enabled: boolean }
}

// Services will be loaded from useServices hook - same source as dashboard

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
  "6:30 PM",
]

const defaultBusinessHours: BusinessHours = {
  monday: { start: "09:00", end: "18:00", enabled: true },
  tuesday: { start: "09:00", end: "18:00", enabled: true },
  wednesday: { start: "09:00", end: "18:00", enabled: true },
  thursday: { start: "09:00", end: "18:00", enabled: true },
  friday: { start: "09:00", end: "18:00", enabled: true },
  saturday: { start: "09:00", end: "18:00", enabled: true },
  sunday: { start: "09:00", end: "18:00", enabled: false },
}

export default function DemoPage() {
  const crmStore = useCRMStore()
  const { services: supabaseServices, isLoaded: servicesLoaded } = useServices()
  const { businessInfo: supabaseBusinessInfo, isLoaded: businessInfoLoaded } = useBusinessInfo()
  const [step, setStep] = useState<Step>("service")
  const [selectedService, setSelectedService] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "", birthdate: "" })
  const [inspirationImages, setInspirationImages] = useState<{ name: string; dataUrl: string }[]>([])
  const [comments, setComments] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"online" | "transferencia" | null>(null)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [transferReceipt, setTransferReceipt] = useState<File | null>(null)
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [locations, setLocations] = useState<Array<{ id: string; name: string; address: string; phone: string }>>([])
  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultBusinessHours)
  const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set())

  const toNumericServiceId = (id: string | number | null | undefined) => {
    const raw = typeof id === "string" ? id : id != null ? String(id) : ""
    const numeric = parseInt(raw.replace(/-/g, "").substring(0, 15), 16)
    return Number.isNaN(numeric) ? Date.now() + Math.random() * 1000 : numeric
  }

  // Map Supabase services to demo format, only show public services
  const services: Service[] = servicesLoaded
    ? supabaseServices
        .filter((s) => s.showPublic)
        .map((s) => ({
          id: toNumericServiceId(s.id),
          name: s.name,
          description: s.description || "",
          price: s.price,
          duration: s.duration,
          requiereAdelanto: s.requiereAdelanto || false,
          montoAdelanto: s.montoAdelanto || 0,
          metodoPago: s.metodoPago || "no-aplica",
          availableDays: s.availableDays,
          customDays: s.customDays,
        }))
    : []

  useEffect(() => {
    if (businessInfoLoaded && supabaseBusinessInfo?.businessHours) {
      setBusinessHours(supabaseBusinessInfo.businessHours)
    }
  }, [businessInfoLoaded, supabaseBusinessInfo])

  useEffect(() => {
    if (!servicesLoaded) return
    const loadLocations = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("locations")
          .select("*")
          .order("created_at", { ascending: false })
        if (error) throw error
        const mapped = (data || []).map((loc: any) => ({
          id: loc.id,
          name: loc.name,
          address: loc.address || "",
          phone: loc.phone || "",
        }))
        setLocations(mapped)
      } catch (error) {
        console.error("Error loading locations:", error)
        setLocations([])
      }
    }
    loadLocations()
  }, [servicesLoaded])

  const to24Hour = (time12: string) => {
    const [time, period] = time12.split(" ")
    const [hours, minutes] = time.split(":")
    let hour24 = parseInt(hours, 10)
    if (period === "PM" && hour24 !== 12) hour24 += 12
    if (period === "AM" && hour24 === 12) hour24 = 0
    return `${hour24.toString().padStart(2, "0")}:${minutes}`
  }

  const toMinutes = (time24: string) => {
    const [hours, minutes] = time24.split(":").map((val) => parseInt(val, 10))
    return (hours || 0) * 60 + (minutes || 0)
  }

  const getDayKey = (dateStr: string) => {
    const day = new Date(dateStr + "T00:00:00")
    const dayIndex = day.getDay()
    const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return dayKeys[dayIndex] || "monday"
  }

  const selectedServiceData = services.find((s) => s.name === selectedService)
  const selectedDayKey = selectedDate ? getDayKey(selectedDate) : null
  const selectedBusinessDay = selectedDayKey ? businessHours[selectedDayKey] : null
  const isBusinessOpen = selectedBusinessDay?.enabled ?? false
  const isServiceAvailable =
    !selectedServiceData?.availableDays ||
    selectedServiceData.availableDays[selectedDayKey || "monday"] !== false

  const isSlotAvailable = (slot: string) => {
    if (!selectedDate || !selectedBusinessDay || !isBusinessOpen || !isServiceAvailable) {
      return false
    }
    const slot24 = to24Hour(slot)
    const slotMinutes = toMinutes(slot24)
    const startMinutes = toMinutes(selectedBusinessDay.start)
    const endMinutes = toMinutes(selectedBusinessDay.end)
    if (slotMinutes < startMinutes || slotMinutes >= endMinutes) return false
    if (bookedTimes.has(slot24)) return false
    return true
  }

  useEffect(() => {
    if (!selectedDate) {
      setBookedTimes(new Set())
      return
    }
    const loadBookedTimes = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("appointments")
          .select("start_time")
          .eq("date", selectedDate)
        if (error) throw error
        const times = new Set<string>()
        ;(data || []).forEach((apt: any) => {
          const time = (apt.start_time || "").toString().substring(0, 5)
          if (time) times.add(time)
        })
        setBookedTimes(times)
      } catch (error) {
        console.error("Error loading booked times:", error)
        setBookedTimes(new Set())
      }
    }
    loadBookedTimes()
  }, [selectedDate])


  const handleServiceSelect = (service: string) => {
    setSelectedService(service)
    setStep("location")
  }

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId)
    setStep("datetime")
  }

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime) {
      setStep("contact")
    }
  }

  const handleContactSubmit = () => {
    if (contactInfo.name && contactInfo.email && contactInfo.phone) {
      setStep("confirmation")
    }
  }

  const handlePaymentSubmit = () => {
    if (!selectedService) {
      setStep("confirmation")
      return
    }

    if (selectedService === "online") {
      if (!cardNumber || !cardExpiry || !cardCvc) {
        alert("Por favor completa todos los datos de la tarjeta")
        return
      }
      setPaymentCompleted(true)
      setTimeout(() => {
        setStep("confirmation")
      }, 1500)
    } else if (selectedService === "transferencia") {
      if (!transferReceipt) {
        alert("Por favor sube el comprobante de transferencia")
        return
      }
      setPaymentCompleted(true)
      setStep("confirmation")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setTransferReceipt(file)
    }
  }

  const handleConfirmBooking = async () => {
    if (!contactInfo.name || !contactInfo.phone) {
      alert("Por favor completa nombre y teléfono")
      return
    }

    // Convert date from DD/MM/YYYY to YYYY-MM-DD if needed
    let dateStr = selectedDate
    if (dateStr.includes("/")) {
      const [day, month, year] = dateStr.split("/")
      dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }

    // Convert time to 24-hour format if needed
    let time24 = selectedTime
    if (selectedTime.includes("AM") || selectedTime.includes("PM")) {
      const [time, period] = selectedTime.split(" ")
      const [hours, minutes] = time.split(":")
      let hour24 = parseInt(hours)
      if (period === "PM" && hour24 !== 12) hour24 += 12
      if (period === "AM" && hour24 === 12) hour24 = 0
      time24 = `${hour24.toString().padStart(2, "0")}:${minutes}`
    }

    try {
      // Upsert customer using CRM store (will save to Supabase if configured)
      await crmStore.upsertCustomer({
        id: `temp_${Date.now()}`, // Temporary ID, will be replaced by Supabase UUID
        fullName: contactInfo.name,
        phone: contactInfo.phone,
        email: contactInfo.email || undefined,
        birthdate: contactInfo.birthdate || undefined,
      })

      // Get the customer ID after upsert (wait a bit for it to be saved)
      await new Promise(resolve => setTimeout(resolve, 200))
      const customer = crmStore.getCustomerByPhone(contactInfo.phone)
      
      if (!customer || !customer.id) {
        throw new Error("No se pudo obtener el ID del cliente después de guardar")
      }
      
      const customerId = customer.id

      // For staff, use null (will be handled by Supabase or can be null)
      const staffId = null

      // Add appointment using CRM store (will save to Supabase if configured)
      await crmStore.addAppointment({
        id: `temp_${Date.now()}`, // Temporary ID, will be replaced by Supabase UUID
        customerId: customerId,
        staffId: staffId,
        serviceName: selectedService,
        date: dateStr,
        startTime: time24,
        baseDuration: 30, // Default duration
        inspirationImages: inspirationImages,
        notes: comments || undefined,
      })

      // Reload CRM store to ensure data is synced
      await new Promise(resolve => setTimeout(resolve, 300))
      crmStore.reload()

      setStep("success")
    } catch (error) {
      console.error("Error saving booking:", error)
      alert("Hubo un error al guardar la reserva. Por favor intenta de nuevo.")
    }
  }

  const handleBack = () => {
    if (step === "location") setStep("service")
    else if (step === "datetime") setStep("location")
    else if (step === "contact") setStep("datetime")
    else if (step === "confirmation") setStep("contact")
  }

  const getProgress = () => {
    if (step === "service") return 0
    if (step === "location") return 25
    if (step === "datetime") return 50
    if (step === "contact") return 75
    if (step === "confirmation") return 100
    return 0
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DFDBF1]/30 via-white to-[#AFA1FD]/20 relative overflow-hidden">
      {/* Floating orbs for visual interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute top-20 left-10 w-64 h-64 bg-[#AFA1FD]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#DFDBF1]/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <AnimatePresence mode="wait">
          {/* Step Indicator */}
          {(
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-4 mb-16"
            >
              {[1, 2, 3, 4].map((num) => {
                const stepProgress = getProgress()
                const stepNum = num === 1 ? 0 : num === 2 ? 25 : num === 3 ? 50 : num === 4 ? 75 : 100
                const isActive = stepNum === stepProgress
                const isCompleted = stepNum < stepProgress
                return (
                  <motion.div
                    key={num}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: num * 0.1 }}
                    className="relative"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all shadow-lg ${
                        isActive
                          ? "bg-gradient-to-br from-[#AFA1FD] to-[#9890E8] text-white scale-110 ring-4 ring-[#AFA1FD]/30"
                          : isCompleted
                            ? "bg-gradient-to-br from-[#AFA1FD] to-[#9890E8] text-white"
                            : "bg-white text-[#AFA1FD] border-2 border-[#DFDBF1]"
                      }`}
                    >
                      {isCompleted ? <Check className="w-7 h-7" /> : num}
                    </div>
                    {num < 4 && (
                      <div
                        className={`absolute top-1/2 left-full w-8 h-1 -translate-y-1/2 transition-all ${
                          isCompleted ? "bg-[#AFA1FD]" : "bg-[#DFDBF1]"
                        }`}
                      />
                    )}
                  </motion.div>
                )
              })}
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
              <h2 className="text-5xl font-bold text-[#2C293F] mb-4">Elige tu servicio</h2>
              <p className="text-xl text-[#AFA1FD] mb-10">Selecciona el servicio que deseas reservar</p>

              <div className="space-y-5 mb-10">
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -3 }}
                    onClick={() => handleServiceSelect(service.name)}
                    className={`bg-white rounded-3xl p-8 border-2 cursor-pointer transition-all shadow-lg hover:shadow-2xl group relative overflow-hidden ${
                      selectedService === service.name
                        ? "border-[#AFA1FD] ring-4 ring-[#AFA1FD]/20"
                        : "border-gray-200 hover:border-[#AFA1FD]"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#AFA1FD]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start relative">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-[#2C293F] mb-3">{service.name}</h3>
                        <p className="text-[#AFA1FD] text-lg mb-4 text-slate-400">{service.description}</p>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">{service.duration} min</span>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-4xl font-bold bg-gradient-to-r from-[#AFA1FD] to-[#9890E8] bg-clip-text text-transparent">
                          S/. {service.price}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 text-[#2C293F] bg-white hover:bg-gray-50 text-lg py-6"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => selectedService && setStep("location")}
                  disabled={!selectedService}
                  className="flex-1 bg-gradient-to-r from-[#2C293F] to-[#3d3a52] hover:from-[#3d3a52] hover:to-[#2C293F] text-white disabled:opacity-50 shadow-lg text-lg py-6"
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Location Selection */}
          {step === "location" && (
            <motion.div
              key="location"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold">Selecciona tu sede</h2>
                <p className="text-[#DFDBF1]/70 text-lg text-slate-400">Elige la ubicación más conveniente para ti</p>
              </div>

              <div className="grid gap-4">
                {locations.map((location) => (
                  <motion.button
                    key={location.id}
                    onClick={() => handleLocationSelect(location.id)}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      selectedLocation === location.id
                        ? "border-[#AFA1FD] bg-[#AFA1FD]/10"
                        : "border-white/10 bg-white/5 hover:border-[#AFA1FD]/50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-[#AFA1FD]/20">
                        <MapPin className="w-6 h-6 text-[#AFA1FD]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{location.name}</h3>
                        <p className="text-[#DFDBF1]/70 mb-1 text-slate-400">{location.address}</p>
                        <p className="text-[#DFDBF1]/50 text-sm text-slate-400">{location.phone}</p>
                      </div>
                      {selectedLocation === location.id && (
                        <div className="p-2 rounded-full bg-[#AFA1FD]">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 bg-white/5 border-white/10 hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
                <Button
                  onClick={() => selectedLocation && setStep("datetime")}
                  disabled={!selectedLocation}
                  className="flex-1 bg-gradient-to-r from-[#AFA1FD] to-[#9890E8] text-white"
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Date & Time Selection */}
          {step === "datetime" && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold">Fecha y hora</h2>
                <p className="text-[#DFDBF1]/70 text-lg text-slate-400">Selecciona cuándo deseas tu cita</p>
              </div>

              <div className="mb-8">
                <Label htmlFor="date" className="text-[#2C293F] font-bold text-lg mb-3 block flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#AFA1FD]" />
                  Fecha
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white border-2 border-gray-300 focus:border-[#AFA1FD] rounded-2xl text-lg py-6 shadow-sm"
                />
              </div>

              <div className="mb-10">
                <Label className="text-[#2C293F] font-bold text-lg mb-4 block flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#AFA1FD]" />
                  Hora
                </Label>
                {selectedDate && (!isBusinessOpen || !isServiceAvailable) && (
                  <p className="text-sm text-red-600 mb-4">
                    {isBusinessOpen
                      ? "El servicio no está disponible este día."
                      : "El negocio no atiende este día."}
                  </p>
                )}
                <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto p-3 bg-gradient-to-br from-[#DFDBF1]/20 to-transparent rounded-2xl">
                  {timeSlots.map((time, index) => (
                    <motion.div
                      key={time}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Button
                        onClick={() => isSlotAvailable(time) && setSelectedTime(time)}
                        variant="outline"
                        disabled={!isSlotAvailable(time)}
                        className={`w-full transition-all shadow-sm ${
                          selectedTime === time
                            ? "bg-gradient-to-r from-[#AFA1FD] to-[#9890E8] text-white border-[#AFA1FD] shadow-lg scale-105"
                            : "bg-white border-gray-300 text-[#AFA1FD] hover:bg-[#DFDBF1]/50 hover:border-[#AFA1FD]"
                        }`}
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
                  className="flex-1 border-2 border-gray-300 text-[#2C293F] bg-white hover:bg-gray-50 text-lg py-6"
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleDateTimeSelect}
                  disabled={!selectedDate || !selectedTime || !isBusinessOpen || !isServiceAvailable}
                  className="flex-1 bg-gradient-to-r from-[#2C293F] to-[#3d3a52] hover:from-[#3d3a52] hover:to-[#2C293F] text-white disabled:opacity-50 shadow-lg text-lg py-6"
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
              <h2 className="text-5xl font-bold text-[#2C293F] mb-4">Información de contacto</h2>
              <p className="text-xl text-[#AFA1FD] mb-10">Necesitamos tus datos para confirmar la cita</p>

              <div className="space-y-7 mb-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Label htmlFor="name" className="text-[#2C293F] font-bold text-lg mb-3 block">
                    Nombre completo
                  </Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                    className="bg-white border-2 border-gray-300 focus:border-[#AFA1FD] rounded-2xl text-lg py-6 shadow-sm"
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Label htmlFor="email" className="text-[#2C293F] font-bold text-lg mb-3 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    className="bg-white border-2 border-gray-300 focus:border-[#AFA1FD] rounded-2xl text-lg py-6 shadow-sm"
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Label htmlFor="phone" className="text-[#2C293F] font-bold text-lg mb-3 block">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    className="bg-white border-2 border-gray-300 focus:border-[#AFA1FD] rounded-2xl text-lg py-6 shadow-sm"
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <BirthdateField
                    value={contactInfo.birthdate}
                    onChange={(value) => setContactInfo({ ...contactInfo, birthdate: value })}
                    label="Fecha de nacimiento (opcional)"
                    className="mb-7"
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <InspirationUploader
                    images={inspirationImages}
                    onChange={(images) => setInspirationImages(images)}
                    maxImages={3}
                    label="Fotos de inspiración (opcional)"
                    className="mb-7"
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <Label htmlFor="comments" className="text-[#2C293F] font-bold text-lg mb-3 block">
                    Comentarios o solicitudes especiales (opcional)
                  </Label>
                  <textarea
                    id="comments"
                    placeholder="Ej: Tengo alergia a ciertos productos, prefiero colores pastel, etc."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full bg-white border-2 border-gray-300 focus:border-[#AFA1FD] rounded-2xl text-lg p-4 shadow-sm min-h-[120px] resize-none"
                    rows={4}
                  />
                </motion.div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 text-[#2C293F] bg-white hover:bg-gray-50 text-lg py-6"
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleContactSubmit}
                  disabled={!contactInfo.name || !contactInfo.email || !contactInfo.phone}
                  className="flex-1 bg-gradient-to-r from-[#AFA1FD] to-[#9890E8] text-white disabled:opacity-50 text-lg py-6"
                >
                  Confirmar Reserva
                </Button>
              </div>
            </motion.div>
          )}

          {step === "confirmation" && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 rounded-full bg-gradient-to-r from-[#10b981] to-[#059669] flex items-center justify-center mx-auto mb-8 shadow-2xl"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-5xl font-bold text-[#2C293F] mb-4">¡Reserva confirmada!</h2>
              <p className="text-xl text-[#AFA1FD] mb-8">Nos vemos pronto</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="border-2 border-gray-300 text-[#2C293F] bg-white hover:bg-gray-50 text-lg py-6 px-12"
                >
                  Volver atrás
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  className="bg-gradient-to-r from-[#AFA1FD] to-[#9890E8] text-white text-lg py-6 px-12"
                >
                  Volver al inicio
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <WhatsAppWidget 
        phoneNumber="+1 234 567 8900" 
        businessName="Lilá"
        message="Hola, tengo una consulta sobre mi reserva."
      />
    </div>
  )
}
