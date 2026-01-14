"use client"

import { useState, useMemo } from "react"
import { User, Phone, Mail, Calendar, ImageIcon, Gift } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format, parseISO, differenceInDays, addYears, isAfter } from "date-fns"
import type { Customer, Appointment } from "@/lib/types/crm"
import { Badge } from "@/components/ui/badge"

interface CustomersListProps {
  customers: Customer[]
  appointments: Appointment[]
  onCustomerClick?: (customer: Customer) => void
}

export function CustomersList({ customers, appointments, onCustomerClick }: CustomersListProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Calculate next birthday
  const getNextBirthday = (birthdate: string): Date | null => {
    if (!birthdate) return null
    try {
      const birth = parseISO(birthdate)
      const today = new Date()
      let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())

      if (isAfter(today, nextBirthday)) {
        nextBirthday = addYears(nextBirthday, 1)
      }

      return nextBirthday
    } catch {
      return null
    }
  }

  // Check if birthday is today
  const isBirthdayToday = (birthdate: string): boolean => {
    if (!birthdate) return false
    try {
      // Parse the birthdate (can be in YYYY-MM-DD format from Supabase)
      const birth = parseISO(birthdate)
      const today = new Date()
      
      // Compare month (0-indexed) and day
      const birthMonth = birth.getMonth()
      const birthDay = birth.getDate()
      const todayMonth = today.getMonth()
      const todayDay = today.getDate()
      
      return birthMonth === todayMonth && birthDay === todayDay
    } catch (error) {
      console.error("Error checking birthday:", error, birthdate)
      return false
    }
  }

  // Check if birthday is soon (within 7 days)
  const isBirthdaySoon = (birthdate: string): boolean => {
    const nextBirthday = getNextBirthday(birthdate)
    if (!nextBirthday) return false
    const daysUntil = differenceInDays(nextBirthday, new Date())
    return daysUntil >= 0 && daysUntil <= 7
  }

  // Get customer appointments
  const getCustomerAppointments = (customerId: string): Appointment[] => {
    return appointments.filter((apt) => apt.customerId === customerId)
  }

  // Get all inspiration images from customer appointments
  const getCustomerImages = (customerId: string) => {
    const customerAppointments = getCustomerAppointments(customerId)
    return customerAppointments.flatMap((apt) => apt.inspirationImages)
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [customers, searchQuery])

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    if (onCustomerClick) {
      onCustomerClick(customer)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AFA1FD] focus:border-transparent"
          />
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#AFA1FD] to-[#8B7FE8] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Contacto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Cumpleaños</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Citas</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer, index) => {
                const nextBirthday = customer.birthdate ? getNextBirthday(customer.birthdate) : null
                const birthdayToday = customer.birthdate ? isBirthdayToday(customer.birthdate) : false
                const birthdaySoon = customer.birthdate ? isBirthdaySoon(customer.birthdate) : false
                const customerImages = getCustomerImages(customer.id)
                const customerAppointments = getCustomerAppointments(customer.id)

                return (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleCustomerClick(customer)}
                    className="hover:bg-purple-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#AFA1FD] to-[#8B7FE8] rounded-full flex items-center justify-center relative flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                          {birthdayToday && (
                            <span className="absolute -top-1 -right-1 text-yellow-500 text-xl leading-none">⭐</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#2C293F]">{customer.fullName}</span>
                            {birthdayToday && (
                              <Badge className="bg-yellow-200 text-yellow-900 border-yellow-400 font-bold text-xs px-2 py-0">
                                <Gift className="w-3 h-3 mr-1" />
                                ¡Cumple hoy!
                              </Badge>
                            )}
                            {!birthdayToday && birthdaySoon && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs px-2 py-0">
                                <Gift className="w-3 h-3 mr-1" />
                                Cumple pronto
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.birthdate && nextBirthday ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(nextBirthday, "dd/MM")}
                            {birthdaySoon && !birthdayToday && (
                              <span className="ml-2 text-yellow-600 font-semibold">
                                (en {differenceInDays(nextBirthday, new Date())} días)
                              </span>
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No registrado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#2C293F]">{customerAppointments.length}</span>
                        <span className="text-sm text-gray-600">citas</span>
                        {customerImages.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-[#AFA1FD] ml-2">
                            <ImageIcon className="w-3 h-3" />
                            <span>{customerImages.length}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-[#AFA1FD] hover:text-[#8B7FE8] text-sm font-medium">
                        Ver detalles
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-600">No se encontraron clientes</p>
            <p className="text-sm text-gray-500 mt-2">Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </div>

        {filteredCustomers.map((customer, index) => {
          const nextBirthday = customer.birthdate ? getNextBirthday(customer.birthdate) : null
          const birthdayToday = customer.birthdate ? isBirthdayToday(customer.birthdate) : false
          const birthdaySoon = customer.birthdate ? isBirthdaySoon(customer.birthdate) : false
          const customerImages = getCustomerImages(customer.id)
          const customerAppointments = getCustomerAppointments(customer.id)

          return (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleCustomerClick(customer)}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-[#AFA1FD] hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#AFA1FD] to-[#8B7FE8] rounded-full flex items-center justify-center relative">
                  <User className="w-6 h-6 text-white" />
                  {birthdayToday && (
                    <span className="absolute -top-1 -right-1 text-yellow-500 text-2xl">⭐</span>
                  )}
                </div>
                {birthdayToday && (
                  <Badge className="bg-yellow-200 text-yellow-900 border-yellow-400 font-bold">
                    <Gift className="w-3 h-3 mr-1" />
                    ¡Cumple hoy!
                  </Badge>
                )}
                {!birthdayToday && birthdaySoon && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Gift className="w-3 h-3 mr-1" />
                    Cumple pronto
                  </Badge>
                )}
              </div>

              <h3 className="text-lg font-bold text-[#2C293F] mb-2">{customer.fullName}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.birthdate && nextBirthday && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Cumpleaños: {format(nextBirthday, "dd/MM")}
                      {birthdaySoon && (
                        <span className="ml-2 text-yellow-600 font-semibold">
                          (en {differenceInDays(nextBirthday, new Date())} días)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{customerAppointments.length}</span> citas
                </div>
                {customerImages.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-[#AFA1FD]">
                    <ImageIcon className="w-4 h-4" />
                    <span>{customerImages.length} fotos</span>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600">No se encontraron clientes</p>
          <p className="text-sm text-gray-500 mt-2">Intenta con otros términos de búsqueda</p>
        </div>
      )}

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#2C293F]">{selectedCustomer.fullName}</h2>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-[#2C293F] mb-3">Información de contacto</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                    )}
                    {selectedCustomer.birthdate && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Cumpleaños: {format(parseISO(selectedCustomer.birthdate), "dd/MM/yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointments */}
                <div>
                  <h3 className="font-semibold text-[#2C293F] mb-3">
                    Citas ({getCustomerAppointments(selectedCustomer.id).length})
                  </h3>
                  <div className="space-y-2">
                    {getCustomerAppointments(selectedCustomer.id).map((apt) => (
                      <div
                        key={apt.id}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <p className="font-semibold text-[#2C293F]">{apt.serviceName}</p>
                        <p className="text-sm text-gray-600">
                          {apt.date} a las {apt.startTime}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inspiration Images */}
                {getCustomerImages(selectedCustomer.id).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-[#2C293F] mb-3">
                      Fotos de inspiración ({getCustomerImages(selectedCustomer.id).length})
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {getCustomerImages(selectedCustomer.id).map((image, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={image.dataUrl}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
