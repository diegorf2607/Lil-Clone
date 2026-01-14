"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useCRMStore } from "@/lib/hooks/use-crm-store"
import { CustomersList } from "@/components/customers-list"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { BirthdateField } from "@/components/birthdate-field"
import { Plus, X, Calendar, Clock } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Service {
  id: number
  name: string
  duration: number
  price: number
}

export default function CustomersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const crmStore = useCRMStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    createAppointment: false,
    appointmentService: "",
    appointmentDate: "",
    appointmentTime: "",
    appointmentStaff: "",
    appointmentNotes: "",
    hasExistingAppointment: false,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Load services from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedServices = localStorage.getItem("lilaServices")
      if (savedServices) {
        try {
          const parsed = JSON.parse(savedServices)
          setServices(parsed.map((s: any) => ({ id: s.id, name: s.name, duration: s.duration || 30, price: s.price || 0 })))
        } catch (e) {
          console.error("Error loading services:", e)
        }
      }
    }
  }, [])

  const handleCreateCustomer = async () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el nombre y teléfono",
        variant: "destructive",
      })
      return
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      })
      return
    }

    // Validate appointment fields if creating appointment
    if (formData.createAppointment && !formData.hasExistingAppointment) {
      if (!formData.appointmentService || !formData.appointmentDate || !formData.appointmentTime) {
        toast({
          title: "Campos de cita requeridos",
          description: "Por favor completa servicio, fecha y hora si vas a crear una cita",
          variant: "destructive",
        })
        return
      }
    }

    try {
      // Create customer first
      await crmStore.upsertCustomer({
        id: `temp_${Date.now()}`,
        fullName: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        birthdate: formData.birthdate || undefined,
      })

      // Wait a bit for the customer to be saved and get the ID
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Get the customer ID after upsert
      const customer = crmStore.getCustomerByPhone(formData.phone)
      if (!customer || !customer.id) {
        throw new Error("No se pudo obtener el ID del cliente después de guardar")
      }
      const customerId = customer.id

      // Create appointment if requested
      if (formData.createAppointment && !formData.hasExistingAppointment) {
        const selectedService = services.find((s) => s.name === formData.appointmentService)
        const staffId = formData.appointmentStaff || `staff_${Date.now()}`

        // Convert date to YYYY-MM-DD format
        let dateStr = formData.appointmentDate
        if (dateStr.includes("/")) {
          const [day, month, year] = dateStr.split("/")
          dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
        }

        // Convert time to 24-hour format if needed
        let time24 = formData.appointmentTime
        if (time24.includes("AM") || time24.includes("PM")) {
          const [time, period] = time24.split(" ")
          const [hours, minutes] = time.split(":")
          let hour24 = parseInt(hours)
          if (period === "PM" && hour24 !== 12) hour24 += 12
          if (period === "AM" && hour24 === 12) hour24 = 0
          time24 = `${hour24.toString().padStart(2, "0")}:${minutes}`
        }

        await crmStore.addAppointment({
          id: `temp_${Date.now()}`,
          customerId,
          staffId,
          serviceName: formData.appointmentService,
          date: dateStr,
          startTime: time24,
          baseDuration: selectedService?.duration || 30,
          inspirationImages: [],
          notes: formData.appointmentNotes || undefined,
        })

        // Wait a bit for the reload triggered by addAppointment to complete
        await new Promise(resolve => setTimeout(resolve, 500))

        toast({
          title: "Cliente y cita creados",
          description: `${formData.name} ha sido agregado con una cita programada`,
        })
      } else if (formData.hasExistingAppointment) {
        toast({
          title: "Cliente creado",
          description: `${formData.name} ha sido agregado. Puedes crear la cita manualmente después.`,
        })
      } else {
        toast({
          title: "Cliente creado",
          description: `${formData.name} ha sido agregado exitosamente`,
        })
      }

      // Wait for reload triggered by upsertCustomer/addAppointment to complete
      // No need to call reload() again as it's already triggered by the operations above
      await new Promise(resolve => setTimeout(resolve, 500))

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        birthdate: "",
        createAppointment: false,
        appointmentService: "",
        appointmentDate: "",
        appointmentTime: "",
        appointmentStaff: "",
        appointmentNotes: "",
        hasExistingAppointment: false,
      })
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Error creating customer:", error)
      toast({
        title: "Error",
        description: "Hubo un error al crear el cliente. Por favor intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Generate time slots
  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"
  ]

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#2C293F] via-[#AFA1FD] to-[#2C293F] bg-clip-text text-transparent mb-3">
            Clientes
          </h1>
          <p className="text-[#AFA1FD] text-lg font-medium">
            Gestiona tus clientes y visualiza sus cumpleaños
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] hover:from-[#9890E8] hover:to-[#7A6FD8] text-white gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Crear Cliente
        </Button>
      </div>

      {crmStore.isLoaded && (
        <CustomersList
          customers={crmStore.data.customers}
          appointments={crmStore.data.appointments}
        />
      )}

      {/* Create Customer Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2C293F]">Crear Nuevo Cliente</DialogTitle>
            <DialogDescription className="text-[#AFA1FD]">
              Completa la información del cliente. La fecha de nacimiento es opcional pero permite notificaciones de cumpleaños.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="customerName" className="text-[#2C293F] font-semibold mb-2 block">
                Nombre completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerName"
                placeholder="Ej: María González"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-gray-300 focus:border-[#AFA1FD]"
              />
            </div>

            <div>
              <Label htmlFor="customerEmail" className="text-[#2C293F] font-semibold mb-2 block">
                Email
              </Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="ejemplo@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-gray-300 focus:border-[#AFA1FD]"
              />
            </div>

            <div>
              <Label htmlFor="customerPhone" className="text-[#2C293F] font-semibold mb-2 block">
                Teléfono <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-gray-300 focus:border-[#AFA1FD]"
              />
            </div>

            <div>
              <BirthdateField
                value={formData.birthdate}
                onChange={(value) => setFormData({ ...formData, birthdate: value })}
                label="Fecha de nacimiento (opcional)"
              />
              <p className="text-xs text-gray-500 mt-2">
                Permite recibir notificaciones cuando se acerque el cumpleaños del cliente
              </p>
            </div>

            {/* Appointment Section */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-[#2C293F] font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Crear cita para este cliente
                </Label>
                <Switch
                  checked={formData.createAppointment || formData.hasExistingAppointment}
                  onCheckedChange={(checked) => {
                    setFormData({
                      ...formData,
                      createAppointment: checked,
                      hasExistingAppointment: false,
                    })
                  }}
                />
              </div>

              {(formData.createAppointment || formData.hasExistingAppointment) && (
                <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Button
                      type="button"
                      variant={!formData.hasExistingAppointment ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, hasExistingAppointment: false, createAppointment: true })}
                      className={!formData.hasExistingAppointment ? "bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white" : ""}
                    >
                      Crear nueva cita
                    </Button>
                    <Button
                      type="button"
                      variant={formData.hasExistingAppointment ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, hasExistingAppointment: true, createAppointment: false })}
                      className={formData.hasExistingAppointment ? "bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white" : ""}
                    >
                      Ya tiene cita (manual)
                    </Button>
                  </div>

                  {!formData.hasExistingAppointment && (
                    <>
                      <div>
                        <Label htmlFor="appointmentService" className="text-[#2C293F] font-semibold mb-2 block">
                          Servicio <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.appointmentService}
                          onValueChange={(value) => setFormData({ ...formData, appointmentService: value })}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-[#AFA1FD]">
                            <SelectValue placeholder="Selecciona un servicio" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.name}>
                                {service.name} - {service.duration} min
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="appointmentDate" className="text-[#2C293F] font-semibold mb-2 block">
                          Fecha <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="appointmentDate"
                          type="date"
                          value={formData.appointmentDate}
                          onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                          className="border-gray-300 focus:border-[#AFA1FD]"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>

                      <div>
                        <Label htmlFor="appointmentTime" className="text-[#2C293F] font-semibold mb-2 block">
                          Hora <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.appointmentTime}
                          onValueChange={(value) => setFormData({ ...formData, appointmentTime: value })}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-[#AFA1FD]">
                            <SelectValue placeholder="Selecciona una hora" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="appointmentStaff" className="text-[#2C293F] font-semibold mb-2 block">
                          Manicurista (opcional)
                        </Label>
                        <Input
                          id="appointmentStaff"
                          placeholder="Nombre del manicurista"
                          value={formData.appointmentStaff}
                          onChange={(e) => setFormData({ ...formData, appointmentStaff: e.target.value })}
                          className="border-gray-300 focus:border-[#AFA1FD]"
                        />
                      </div>

                      <div>
                        <Label htmlFor="appointmentNotes" className="text-[#2C293F] font-semibold mb-2 block">
                          Notas (opcional)
                        </Label>
                        <Input
                          id="appointmentNotes"
                          placeholder="Notas adicionales sobre la cita"
                          value={formData.appointmentNotes}
                          onChange={(e) => setFormData({ ...formData, appointmentNotes: e.target.value })}
                          className="border-gray-300 focus:border-[#AFA1FD]"
                        />
                      </div>
                    </>
                  )}

                  {formData.hasExistingAppointment && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        El cliente será creado sin cita. Puedes crear la cita manualmente desde el calendario después.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false)
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  birthdate: "",
                  createAppointment: false,
                  appointmentService: "",
                  appointmentDate: "",
                  appointmentTime: "",
                  appointmentStaff: "",
                  appointmentNotes: "",
                  hasExistingAppointment: false,
                })
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCustomer}
              className="bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white hover:from-[#9890E8] hover:to-[#7A6FD8]"
            >
              Crear Cliente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
