"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Plus, Edit, Trash2, X, Building2, Phone, Mail, Users, ArrowLeft, Save, Search } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Location {
  id: string
  name: string
  address: string
  phone: string
  email: string
  staffCount: number
  isActive: boolean
  createdAt: string
}

export default function LocationsManagement() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    staffCount: 0,
    isActive: true,
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "dueno")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const loadLocations = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("locations").select("*").order("created_at", { ascending: false })
      if (error) throw error
      const mapped = (data || []).map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        address: loc.address || "",
        phone: loc.phone || "",
        email: loc.email || "",
        staffCount: loc.staff_count || 0,
        isActive: loc.is_active ?? true,
        createdAt: loc.created_at || new Date().toISOString(),
      }))
      setLocations(mapped)
    } catch (error) {
      console.error("Error loading locations:", error)
      setLocations([])
    }
  }, [])

  useEffect(() => {
    if (!isLoading && user?.role === "dueno") {
      loadLocations()
    }
  }, [isLoading, user, loadLocations])

  const handleOpenModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location)
      setFormData({
        name: location.name,
        address: location.address,
        phone: location.phone,
        email: location.email,
        staffCount: location.staffCount,
        isActive: location.isActive,
      })
    } else {
      setEditingLocation(null)
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        staffCount: 0,
        isActive: true,
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLocation(null)
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      staffCount: 0,
      isActive: true,
    })
  }

  const handleSaveLocation = async () => {
    try {
      const supabase = createClient()
      if (editingLocation) {
        const { error } = await supabase
          .from("locations")
          .update({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            staff_count: formData.staffCount,
            is_active: formData.isActive,
          })
          .eq("id", editingLocation.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("locations").insert({
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          staff_count: formData.staffCount,
          is_active: formData.isActive,
        })
        if (error) throw error
      }
      await loadLocations()
      handleCloseModal()
    } catch (error) {
      console.error("Error saving location:", error)
      alert("Error al guardar la ubicación")
    }
  }

  const handleDeleteLocation = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta ubicación?")) {
      try {
        const supabase = createClient()
        const { error } = await supabase.from("locations").delete().eq("id", id)
        if (error) throw error
        await loadLocations()
      } catch (error) {
        console.error("Error deleting location:", error)
        alert("Error al eliminar la ubicación")
      }
    }
  }

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
    <div className="min-h-screen bg-gradient-to-br from-white via-[#DFDBF1]/20 to-[#AFA1FD]/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[#AFA1FD]/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/dueno">
                <Button variant="outline" size="sm" className="border-[#AFA1FD]/30 bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#AFA1FD] to-[#DFDBF1] rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#2C293F]">Gestión de Locales</h1>
                  <p className="text-sm text-[#2C293F]/60">{locations.length} locales registrados</p>
                </div>
              </div>
            </div>
            <Button onClick={() => handleOpenModal()} className="bg-[#2C293F] text-white hover:brightness-110">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Local
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-[#AFA1FD]/20 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AFA1FD]" />
            <Input
              type="text"
              placeholder="Buscar por nombre o dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 border-[#AFA1FD]/30 focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 rounded-xl"
            />
          </div>
        </motion.div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#AFA1FD]/20 hover:border-[#AFA1FD]/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#AFA1FD]/20 to-[#DFDBF1]/20 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#AFA1FD]" />
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    location.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {location.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#2C293F] mb-3">{location.name}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm text-[#2C293F]/70">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{location.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#2C293F]/70">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{location.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#2C293F]/70">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>{location.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#2C293F]/70">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>{location.staffCount} miembros del staff</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-[#AFA1FD]/10">
                <Button
                  onClick={() => handleOpenModal(location)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#AFA1FD]/30"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={() => handleDeleteLocation(location.id)}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredLocations.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Building2 className="w-16 h-16 text-[#AFA1FD]/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#2C293F] mb-2">No se encontraron locales</h3>
            <p className="text-[#2C293F]/60 mb-6">
              {searchQuery ? "Intenta con otra búsqueda" : "Comienza agregando tu primer local"}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenModal()} className="bg-[#2C293F] text-white hover:brightness-110">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Local
              </Button>
            )}
          </motion.div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-[#AFA1FD]/20 p-6 flex items-center justify-between rounded-t-3xl">
                  <h2 className="text-2xl font-bold text-[#2C293F]">
                    {editingLocation ? "Editar Local" : "Agregar Nuevo Local"}
                  </h2>
                  <Button
                    onClick={handleCloseModal}
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-transparent"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#2C293F] font-medium">
                      Nombre del Local *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Sucursal Centro"
                      className="h-12 border-[#AFA1FD]/30 focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-[#2C293F] font-medium">
                      Dirección *
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Ej: Av. Principal 123, Centro"
                      className="h-12 border-[#AFA1FD]/30 focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[#2C293F] font-medium">
                        Teléfono *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 234 567 8900"
                        className="h-12 border-[#AFA1FD]/30 focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#2C293F] font-medium">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="local@lila.com"
                        className="h-12 border-[#AFA1FD]/30 focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staffCount" className="text-[#2C293F] font-medium">
                      Cantidad de Staff
                    </Label>
                    <Input
                      id="staffCount"
                      type="number"
                      min="0"
                      value={formData.staffCount}
                      onChange={(e) => setFormData({ ...formData, staffCount: Number.parseInt(e.target.value) || 0 })}
                      className="h-12 border-[#AFA1FD]/30 focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 rounded-xl"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-[#AFA1FD]/5 rounded-xl">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded border-[#AFA1FD]/30 text-[#AFA1FD] focus:ring-[#AFA1FD]/20"
                    />
                    <Label htmlFor="isActive" className="text-[#2C293F] font-medium cursor-pointer">
                      Local activo
                    </Label>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-[#AFA1FD]/20 p-6 flex gap-3 rounded-b-3xl">
                  <Button
                    onClick={handleCloseModal}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl bg-transparent"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveLocation}
                    className="flex-1 h-12 bg-[#2C293F] text-white hover:brightness-110 rounded-xl"
                    disabled={!formData.name || !formData.address || !formData.phone || !formData.email}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingLocation ? "Guardar Cambios" : "Crear Local"}
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
