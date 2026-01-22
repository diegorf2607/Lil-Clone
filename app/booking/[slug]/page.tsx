"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "react-toastify"
import type { Service } from "@/types" // Assuming Service is imported from a types file
import { DollarSign, Lock, Check, ChevronLeft, Scissors, User } from "lucide-react" // Assuming these icons are imported from lucide-react
import { businessInfo } from "@/config" // Assuming businessInfo is imported from a config file
import { Input, Textarea, Button, Label } from "@/components/ui" // Assuming these components are imported from a components file
import Link from "next/link"

export default function BookingPage() {
  const [bookingStep, setBookingStep] = useState<"service" | "datetime" | "info" | "confirmation">("service")
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)

  const [paymentRequired, setPaymentRequired] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<"online" | "transferencia" | null>(null)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  })

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)

    if (service.requiereAdelanto) {
      setPaymentRequired(true)
      setPaymentAmount(service.montoAdelanto)
      setPaymentMethod(service.metodoPago as "online" | "transferencia")
    } else {
      setPaymentRequired(false)
      setPaymentAmount(0)
      setPaymentMethod(null)
    }

    setBookingStep("datetime")
  }

  const handlePayment = async () => {
    if (!paymentMethod) return

    setProcessingPayment(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (paymentMethod === "online") {
      console.log("[v0] Processing online payment for", paymentAmount)
      setPaymentCompleted(true)
    } else if (paymentMethod === "transferencia") {
      console.log("[v0] Manual transfer instructions shown")
      setPaymentCompleted(true)
    }

    setProcessingPayment(false)
  }

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return

    if (paymentRequired && !paymentCompleted) {
      toast({
        title: "Pago requerido",
        description: "Por favor completa el pago del adelanto para confirmar tu reserva",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!clientInfo.name || !clientInfo.email) {
      toast({
        title: "Información incompleta",
        description: "Por favor completa tu nombre y email",
        variant: "destructive",
      })
      return
    }

    if (!emailRegex.test(clientInfo.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      })
      return
    }

    const bookingData = {
      service: selectedService.name,
      date: selectedDate.toISOString(),
      time: selectedTime,
      client: clientInfo,
      staff: selectedStaff,
      isPack: selectedService.esPack,
      packId: selectedService.esPack ? `pack-${Date.now()}` : undefined,
      subServices: selectedService.esPack ? selectedService.subservicios : undefined,
      paymentRequired,
      paymentCompleted,
      paymentAmount,
      paymentMethod,
    }

    console.log("[v0] Booking confirmed:", bookingData)

    toast({
      title: "Reserva confirmada",
      description: selectedService.esPack
        ? `Tu pack de ${selectedService.subservicios?.length} servicios ha sido reservado`
        : "Tu reserva ha sido confirmada exitosamente",
    })

    setBookingStep("confirmation")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {bookingStep === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-[#2C293F] mb-6">Tus datos</h2>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="clientName" className="text-[#2C293F] font-semibold mb-2 block">
                      Nombre completo *
                    </Label>
                    <Input
                      id="clientName"
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                      placeholder="Tu nombre"
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
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                      placeholder="tu@email.com"
                      className="border-gray-300 focus:border-[#AFA1FD]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientPhone" className="text-[#2C293F] font-semibold mb-2 block">
                      Teléfono
                    </Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                      className="border-gray-300 focus:border-[#AFA1FD]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientNotes" className="text-[#2C293F] font-semibold mb-2 block">
                      Notas adicionales (opcional)
                    </Label>
                    <Textarea
                      id="clientNotes"
                      value={clientInfo.notes}
                      onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                      placeholder="Alguna preferencia o comentario..."
                      className="border-gray-300 focus:border-[#AFA1FD] min-h-[100px]"
                    />
                  </div>

                  {paymentRequired && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t-2 border-gray-200 pt-6 mt-6"
                    >
                      <div className="bg-gradient-to-r from-[#AFA1FD]/10 to-[#DFDBF1]/20 rounded-xl p-6 border-2 border-[#AFA1FD]/30">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#AFA1FD] to-[#8B7FE8] flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-[#2C293F] mb-2">Adelanto requerido</h3>
                            <p className="text-gray-600 mb-4">
                              Este servicio requiere un adelanto de{" "}
                              <span className="font-bold text-[#AFA1FD]">${paymentAmount}</span> para confirmar tu
                              reserva.
                            </p>

                            {!paymentCompleted ? (
                              <div className="space-y-4">
                                {paymentMethod === "online" && (
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-3">
                                      Serás redirigido a nuestro procesador de pagos seguro para completar el adelanto.
                                    </p>
                                    <Button
                                      onClick={handlePayment}
                                      disabled={processingPayment}
                                      className="w-full bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] hover:from-[#9890E8] hover:to-[#7A6FD8] text-white"
                                    >
                                      {processingPayment ? (
                                        <>
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                          Procesando...
                                        </>
                                      ) : (
                                        <>
                                          <Lock className="w-4 h-4 mr-2" />
                                          Pagar ${paymentAmount} ahora
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                )}

                                {paymentMethod === "transferencia" && (
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h4 className="font-semibold text-[#2C293F] mb-3">
                                      Instrucciones para transferencia
                                    </h4>
                                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                                      <p>
                                        <strong>Banco:</strong> Banco Nacional
                                      </p>
                                      <p>
                                        <strong>Cuenta:</strong> 1234-5678-9012-3456
                                      </p>
                                      <p>
                                        <strong>Titular:</strong> {businessInfo.name}
                                      </p>
                                      <p>
                                        <strong>Monto:</strong> ${paymentAmount}
                                      </p>
                                      <p className="text-xs text-[#AFA1FD] mt-2">
                                        Por favor incluye tu nombre en la referencia de la transferencia
                                      </p>
                                    </div>
                                    <Button
                                      onClick={handlePayment}
                                      disabled={processingPayment}
                                      className="w-full bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] hover:from-[#9890E8] hover:to-[#7A6FD8] text-white"
                                    >
                                      {processingPayment ? (
                                        <>
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                          Confirmando...
                                        </>
                                      ) : (
                                        <>
                                          <Check className="w-4 h-4 mr-2" />
                                          Ya realicé la transferencia
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                  <Check className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-green-900">Pago confirmado</p>
                                  <p className="text-sm text-green-700">
                                    {paymentMethod === "online"
                                      ? "Tu pago ha sido procesado exitosamente"
                                      : "Hemos recibido la confirmación de tu transferencia"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-[#2C293F] mb-4">Resumen de tu reserva</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Servicio:</span>
                        <span className="font-semibold text-[#2C293F]">{selectedService?.name}</span>
                      </div>
                      {selectedService?.esPack && selectedService.subservicios && (
                        <div className="pl-4 space-y-1 border-l-2 border-[#AFA1FD]/30">
                          {selectedService.subservicios.map((sub, idx) => (
                            <div key={sub.id} className="text-xs text-gray-500 flex items-center gap-2">
                              <span className="font-semibold text-[#AFA1FD]">#{idx + 1}</span>
                              {sub.nombre} ({sub.duracion} min)
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha:</span>
                        <span className="font-semibold text-[#2C293F]">
                          {selectedDate?.toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hora:</span>
                        <span className="font-semibold text-[#2C293F]">{selectedTime}</span>
                      </div>
                      {selectedStaff && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Especialista:</span>
                          <span className="font-semibold text-[#2C293F]">{selectedStaff}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-3 border-t border-gray-200">
                        <span className="text-gray-600">Precio total:</span>
                        <span className="font-bold text-[#AFA1FD] text-lg">${selectedService?.price}</span>
                      </div>
                      {paymentRequired && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Adelanto pagado:</span>
                          <span className={`font-semibold ${paymentCompleted ? "text-green-600" : "text-orange-600"}`}>
                            {paymentCompleted ? `$${paymentAmount}` : "Pendiente"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    onClick={() => setBookingStep("datetime")}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 hover:border-[#AFA1FD] hover:text-[#AFA1FD] bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                  <Button
                    onClick={handleConfirmBooking}
                    disabled={paymentRequired && !paymentCompleted}
                    className="flex-1 bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] hover:from-[#9890E8] hover:to-[#7A6FD8] text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmar reserva
                    <Check className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {bookingStep === "confirmation" && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-[#2C293F] mb-4">Reserva confirmada</h2>
                <p className="text-gray-600 mb-8">
                  {selectedService?.esPack
                    ? `Tu pack de ${selectedService.subservicios?.length} servicios ha sido reservado exitosamente`
                    : "Tu reserva ha sido confirmada exitosamente"}
                </p>

                {paymentCompleted && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-green-900">Pago confirmado</p>
                    </div>
                    <p className="text-sm text-green-700">
                      {paymentMethod === "online"
                        ? `Hemos procesado tu adelanto de $${paymentAmount}`
                        : `Hemos registrado tu transferencia de $${paymentAmount}. Te confirmaremos por email cuando la verifiquemos.`}
                    </p>
                  </div>
                )}

                <div className="bg-gradient-to-r from-[#AFA1FD]/10 to-[#DFDBF1]/20 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-[#2C293F] mb-4">Detalles de tu reserva</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-[#AFA1FD] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Fecha y hora</p>
                        <p className="font-semibold text-[#2C293F]">
                          {selectedDate?.toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          a las {selectedTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Scissors className="w-5 h-5 text-[#AFA1FD] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Servicio</p>
                        <p className="font-semibold text-[#2C293F]">{selectedService?.name}</p>
                        {selectedService?.esPack && selectedService.subservicios && (
                          <div className="mt-2 space-y-1">
                            {selectedService.subservicios.map((sub, idx) => (
                              <div key={sub.id} className="text-xs text-gray-500 flex items-center gap-2">
                                <span className="font-semibold text-[#AFA1FD]">#{idx + 1}</span>
                                {sub.nombre} - {sub.personalName} ({sub.duracion} min)
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-[#AFA1FD] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Tus datos</p>
                        <p className="font-semibold text-[#2C293F]">{clientInfo.name}</p>
                        <p className="text-sm text-gray-500">{clientInfo.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-[#AFA1FD] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Precio total</p>
                        <p className="font-bold text-[#AFA1FD] text-lg">${selectedService?.price}</p>
                        {paymentCompleted && (
                          <p className="text-xs text-green-600 mt-1">Adelanto de ${paymentAmount} pagado</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>Importante:</strong> Hemos enviado un email de confirmación a {clientInfo.email} con todos
                    los detalles de tu reserva.
                  </p>
                </div>

                <Link href="/">
                  <Button className="bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] hover:from-[#9890E8] hover:to-[#7A6FD8] text-white">
                    Volver al inicio
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
