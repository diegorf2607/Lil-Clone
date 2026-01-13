"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Calendar, Mail, Phone, Star, Gift, Clock, TrendingUp, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"

interface Reservation {
  id: string
  clientName: string
  email: string
  phone: string
  dateTime: string
  service: string
  status: "confirmed" | "completed" | "cancelled"
  totalVisits: number
  loyaltyPoints: number
  memberSince: string
  lastVisit: string
  favoriteServices: string[]
  totalSpent: number
  upcomingReservations: Array<{
    date: string
    service: string
  }>
  pastReservations: Array<{
    date: string
    service: string
    amount: number
  }>
}

const mockReservations: Reservation[] = [
  {
    id: "1",
    clientName: "Ana García",
    email: "ana@email.com",
    phone: "+54 11 1234-5678",
    dateTime: "2025-11-06 10:00 AM",
    service: "Corte y coloración",
    status: "confirmed",
    totalVisits: 12,
    loyaltyPoints: 450,
    memberSince: "Enero 2024",
    lastVisit: "2025-10-15",
    favoriteServices: ["Corte y coloración", "Tratamiento capilar"],
    totalSpent: 45000,
    upcomingReservations: [
      { date: "2025-11-06 10:00 AM", service: "Corte y coloración" },
      { date: "2025-12-10 3:00 PM", service: "Tratamiento capilar" },
    ],
    pastReservations: [
      { date: "2025-10-15", service: "Corte", amount: 3500 },
      { date: "2025-09-20", service: "Coloración", amount: 8000 },
      { date: "2025-08-12", service: "Tratamiento", amount: 5500 },
    ],
  },
  {
    id: "2",
    clientName: "María López",
    email: "maria@email.com",
    phone: "+54 11 2345-6789",
    dateTime: "2025-11-05 2:30 PM",
    service: "Manicura y pedicura",
    status: "completed",
    totalVisits: 8,
    loyaltyPoints: 280,
    memberSince: "Marzo 2024",
    lastVisit: "2025-11-05",
    favoriteServices: ["Manicura", "Pedicura"],
    totalSpent: 28000,
    upcomingReservations: [],
    pastReservations: [
      { date: "2025-11-05", service: "Manicura y pedicura", amount: 4500 },
      { date: "2025-10-22", service: "Manicura", amount: 2500 },
      { date: "2025-09-30", service: "Pedicura", amount: 3000 },
    ],
  },
  {
    id: "3",
    clientName: "Laura Martínez",
    email: "laura@email.com",
    phone: "+54 11 3456-7890",
    dateTime: "2025-11-07 4:00 PM",
    service: "Corte",
    status: "confirmed",
    totalVisits: 5,
    loyaltyPoints: 150,
    memberSince: "Junio 2024",
    lastVisit: "2025-10-01",
    favoriteServices: ["Corte"],
    totalSpent: 17500,
    upcomingReservations: [{ date: "2025-11-07 4:00 PM", service: "Corte" }],
    pastReservations: [
      { date: "2025-10-01", service: "Corte", amount: 3500 },
      { date: "2025-08-15", service: "Corte", amount: 3500 },
    ],
  },
]

export default function ReservasPage() {
  const [selectedClient, setSelectedClient] = useState<Reservation | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredReservations = mockReservations.filter((reservation) => {
    const matchesSearch =
      reservation.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-[#AFA1FD]/20 text-[#2C293F]"
      case "completed":
        return "bg-green-100 text-green-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getLoyaltyTier = (points: number) => {
    if (points >= 500) return { name: "Platinum", color: "text-purple-600", icon: "💎" }
    if (points >= 300) return { name: "Gold", color: "text-yellow-600", icon: "⭐" }
    if (points >= 100) return { name: "Silver", color: "text-gray-500", icon: "🥈" }
    return { name: "Bronze", color: "text-orange-600", icon: "🥉" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DFDBF1]/30 via-white to-[#AFA1FD]/10">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/lila-logo.png" alt="Lilá" width={120} height={40} className="h-8 w-auto" priority />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline" style={{ borderColor: "#2C293F", color: "#2C293F" }}>
                  Cerrar sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#2C293F" }}>
            Reservas
          </h1>
          <p className="text-lg" style={{ color: "#AFA1FD" }}>
            Gestiona todas las reservas de tu negocio
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/demo" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto whitespace-nowrap"
              style={{ backgroundColor: "#AFA1FD", color: "white" }}
            >
              + Crear reserva
            </Button>
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 hidden md:table-cell">
                    Fecha y hora
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 hidden lg:table-cell">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedClient(reservation)}
                  >
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-900">{reservation.clientName}</span>
                        <span className="text-xs text-[#AFA1FD] sm:hidden">{reservation.email}</span>
                        <span className="text-xs text-gray-500 md:hidden mt-1">{reservation.service}</span>
                        <div className="flex gap-2 sm:hidden mt-2 justify-start items-start">
                          {reservation.status === "confirmed" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white border-0 text-xs px-3 py-1.5 whitespace-nowrap flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle completion logic here
                              }}
                            >
                              Completar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-3 py-1.5 whitespace-nowrap border-red-300 text-red-600 hover:bg-red-50 bg-transparent flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle cancellation logic here
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#AFA1FD] hidden sm:table-cell">{reservation.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{reservation.dateTime}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{reservation.service}</td>
                    <td className="px-3 sm:px-6 py-4">
                      <span
                        className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}
                      >
                        <span className="hidden sm:inline">{reservation.status}</span>
                        <span className="sm:hidden">
                          {reservation.status === "confirmed"
                            ? "Conf."
                            : reservation.status === "completed"
                              ? "Compl."
                              : "Canc."}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                      <div className="flex gap-2">
                        {reservation.status === "confirmed" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white border-0 text-sm px-3 py-1.5 whitespace-nowrap"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle completion logic here
                            }}
                          >
                            Completar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-sm px-3 py-1.5 whitespace-nowrap bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle cancellation logic here
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Total de reservas: <span className="font-semibold">{filteredReservations.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Client Detail Sidebar */}
      <AnimatePresence>
        {selectedClient && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSelectedClient(null)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#2C293F] to-[#AFA1FD] text-white p-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedClient.clientName}</h2>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <Mail size={14} />
                    <span>{selectedClient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
                    <Phone size={14} />
                    <span>{selectedClient.phone}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Loyalty Program */}
                <div className="bg-gradient-to-br from-[#AFA1FD]/20 to-[#DFDBF1]/30 rounded-lg p-4 border border-[#AFA1FD]/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#2C293F] flex items-center gap-2">
                      <Gift className="text-[#AFA1FD]" size={20} />
                      Programa de Fidelidad
                    </h3>
                    <span className={`text-2xl ${getLoyaltyTier(selectedClient.loyaltyPoints).color}`}>
                      {getLoyaltyTier(selectedClient.loyaltyPoints).icon}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Nivel:</span>
                      <span className={`font-semibold ${getLoyaltyTier(selectedClient.loyaltyPoints).color}`}>
                        {getLoyaltyTier(selectedClient.loyaltyPoints).name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Puntos:</span>
                      <span className="font-semibold text-[#2C293F]">{selectedClient.loyaltyPoints}</span>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#AFA1FD] to-[#2C293F] h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((selectedClient.loyaltyPoints / 500) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {500 - selectedClient.loyaltyPoints > 0
                          ? `${500 - selectedClient.loyaltyPoints} puntos para Platinum`
                          : "Nivel máximo alcanzado"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Client Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="text-[#AFA1FD]" size={18} />
                      <span className="text-sm text-gray-600">Total Visitas</span>
                    </div>
                    <p className="text-2xl font-bold text-[#2C293F]">{selectedClient.totalVisits}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="text-[#AFA1FD]" size={18} />
                      <span className="text-sm text-gray-600">Total Gastado</span>
                    </div>
                    <p className="text-2xl font-bold text-[#2C293F]">${selectedClient.totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="text-[#AFA1FD]" size={18} />
                      <span className="text-sm text-gray-600">Cliente desde</span>
                    </div>
                    <p className="text-lg font-semibold text-[#2C293F]">{selectedClient.memberSince}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="text-[#AFA1FD]" size={18} />
                      <span className="text-sm text-gray-600">Última Visita</span>
                    </div>
                    <p className="text-lg font-semibold text-[#2C293F]">{selectedClient.lastVisit}</p>
                  </div>
                </div>

                {/* Recurring Client Badge */}
                {selectedClient.totalVisits >= 5 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <Star className="text-green-600" size={24} fill="currentColor" />
                    <div>
                      <p className="font-semibold text-green-900">Cliente Recurrente</p>
                      <p className="text-sm text-green-700">
                        Este cliente ha visitado {selectedClient.totalVisits} veces
                      </p>
                    </div>
                  </div>
                )}

                {/* Favorite Services */}
                <div>
                  <h3 className="font-semibold text-[#2C293F] mb-3">Servicios Favoritos</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedClient.favoriteServices.map((service, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#DFDBF1] text-[#2C293F] rounded-full text-sm font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Upcoming Reservations */}
                {selectedClient.upcomingReservations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-[#2C293F] mb-3">Próximas Reservas</h3>
                    <div className="space-y-2">
                      {selectedClient.upcomingReservations.map((reservation, index) => (
                        <div key={index} className="bg-[#AFA1FD]/10 border border-[#AFA1FD]/30 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-[#2C293F]">{reservation.service}</p>
                              <p className="text-sm text-gray-600">{reservation.date}</p>
                            </div>
                            <Calendar className="text-[#AFA1FD]" size={18} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Reservations */}
                <div>
                  <h3 className="font-semibold text-[#2C293F] mb-3">Historial de Reservas</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {selectedClient.pastReservations.map((reservation, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-[#2C293F]">{reservation.service}</p>
                            <p className="text-sm text-gray-600">{reservation.date}</p>
                          </div>
                          <p className="font-semibold text-[#2C293F]">${reservation.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button className="flex-1" style={{ backgroundColor: "#2C293F" }}>
                    Nueva Reserva
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    style={{ borderColor: "#2C293F", color: "#2C293F" }}
                  >
                    Editar Cliente
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
