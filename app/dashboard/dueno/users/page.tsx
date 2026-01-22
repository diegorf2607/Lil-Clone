"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Plus,
  Edit,
  Trash2,
  X,
  ArrowLeft,
  Save,
  Search,
  Shield,
  User,
  Headset,
  Building2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  locationId?: string
  locationName?: string
  isActive: boolean
  createdAt: string
}

const ROLE_LABELS: Record<UserRole, string> = {
  dueno: "Dueño",
  administrador: "Administrador",
  recepcionista: "Recepcionista",
  staff: "Staff",
}

const ROLE_ICONS: Record<UserRole, any> = {
  dueno: Building2,
  administrador: Shield,
  recepcionista: Headset,
  staff: User,
}

export default function UsersManagement() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "staff" as UserRole,
    locationId: "",
    isActive: true,
  })

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "dueno" && user.role !== "administrador"))) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const loadLocations = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("locations").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setLocations(data || [])
      return data || []
    } catch (error) {
      console.error("Error loading locations:", error)
      setLocations([])
      return []
    }
  }, [])

  const loadUsers = useCallback(
    async (locationsData?: any[]) => {
      try {
        const res = await fetch("/api/admin/users")
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Error loading users")

        const locationMap = new Map((locationsData || locations).map((loc: any) => [loc.id, loc.name]))
        const mappedUsers = (json.users || []).map((u: any) => ({
          id: u.id,
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          role: u.role as UserRole,
          locationId: u.location_id || "",
          locationName: u.location_id ? locationMap.get(u.location_id) : undefined,
          isActive: u.is_active ?? true,
          createdAt: u.created_at || new Date().toISOString(),
        }))
        setUsers(mappedUsers)
      } catch (error) {
        console.error("Error loading users:", error)
        setUsers([])
      }
    },
    [locations]
  )

  useEffect(() => {
    if (!user) return
    const loadAll = async () => {
      const loadedLocations = await loadLocations()
      await loadUsers(loadedLocations)
    }
    loadAll()
  }, [user, loadLocations, loadUsers])

  const handleOpenModal = (userData?: UserData) => {
    if (userData) {
      setEditingUser(userData)
      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: "",
        role: userData.role,
        locationId: userData.locationId || "",
        isActive: userData.isActive,
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "staff",
        locationId: "",
        isActive: true,
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "staff",
      locationId: "",
      isActive: true,
    })
  }

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email || !formData.phone) return
    if (!editingUser && !formData.password) {
      alert("Ingresa una contraseña para el nuevo usuario.")
      return
    }

    try {
      if (editingUser) {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingUser.id,
            updates: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              password: formData.password || undefined,
              role: formData.role,
              locationId: formData.locationId || null,
              isActive: formData.isActive,
            },
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Error updating user")
      } else {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: formData.role,
            locationId: formData.locationId || null,
            isActive: formData.isActive,
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Error creating user")
      }

      await loadUsers()
      handleCloseModal()
    } catch (error: any) {
      console.error("Error saving user:", error)
      alert(error?.message || "Error al guardar usuario")
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error deleting user")
      await loadUsers()
    } catch (error: any) {
      console.error("Error deleting user:", error)
      alert(error?.message || "Error al eliminar usuario")
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

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
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#2C293F]">Gestión de Usuarios</h1>
                  <p className="text-sm text-[#2C293F]/60">{users.length} usuarios registrados</p>
                </div>
              </div>
            </div>
            <Button onClick={() => handleOpenModal()} className="bg-[#2C293F] text-white hover:brightness-110">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Usuario
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-[#AFA1FD]/20 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AFA1FD]" />
              <Input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 border-[#AFA1FD]/30 focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={roleFilter === "all" ? "default" : "outline"}
                onClick={() => setRoleFilter("all")}
                className={roleFilter === "all" ? "bg-[#2C293F] text-white" : "bg-transparent"}
              >
                Todos
              </Button>
              <Button
                variant={roleFilter === "dueno" ? "default" : "outline"}
                onClick={() => setRoleFilter("dueno")}
                className={roleFilter === "dueno" ? "bg-[#2C293F] text-white" : "bg-transparent"}
              >
                Dueños
              </Button>
              <Button
                variant={roleFilter === "administrador" ? "default" : "outline"}
                onClick={() => setRoleFilter("administrador")}
                className={roleFilter === "administrador" ? "bg-[#2C293F] text-white" : "bg-transparent"}
              >
                Admins
              </Button>
              <Button
                variant={roleFilter === "recepcionista" ? "default" : "outline"}
                onClick={() => setRoleFilter("recepcionista")}
                className={roleFilter === "recepcionista" ? "bg-[#2C293F] text-white" : "bg-transparent"}
              >
                Recepción
              </Button>
              <Button
                variant={roleFilter === "staff" ? "default" : "outline"}
                onClick={() => setRoleFilter("staff")}
                className={roleFilter === "staff" ? "bg-[#2C293F] text-white" : "bg-transparent"}
              >
                Staff
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((userData, index) => {
            const RoleIcon = ROLE_ICONS[userData.role]
            return (
              <motion.div
                key={userData.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#AFA1FD]/20 hover:border-[#AFA1FD]/40 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#AFA1FD]/20 to-[#DFDBF1]/20 rounded-xl flex items-center justify-center">
                    <RoleIcon className="w-6 h-6 text-[#AFA1FD]" />
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        userData.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {userData.isActive ? "Activo" : "Inactivo"}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full font-medium bg-[#AFA1FD]/10 text-[#AFA1FD]">
                      {ROLE_LABELS[userData.role]}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#2C293F] mb-3">{userData.name}</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-[#2C293F]/70">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#2C293F]/70">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{userData.phone}</span>
                  </div>
                  {userData.locationName && (
                    <div className="flex items-center gap-2 text-sm text-[#2C293F]/70">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{userData.locationName}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-[#AFA1FD]/10">
                  <Button
                    onClick={() => handleOpenModal(userData)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#AFA1FD]/30 bg-transparent"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDeleteUser(userData.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredUsers.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Users className="w-16 h-16 text-[#AFA1FD]/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#2C293F] mb-2">No se encontraron usuarios</h3>
            <p className="text-[#2C293F]/60 mb-6">
              {searchQuery || roleFilter !== "all"
                ? "Intenta con otra búsqueda o filtro"
                : "Comienza agregando usuarios"}
            </p>
            {!searchQuery && roleFilter === "all" && (
              <Button onClick={() => handleOpenModal()} className="bg-[#2C293F] text-white hover:brightness-110">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Usuario
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
                    {editingUser ? "Editar Usuario" : "Agregar Nuevo Usuario"}
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
                      Nombre Completo *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: María González"
                      className="h-12 border-[#AFA1FD]/30 focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#2C293F] font-medium">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="usuario@lila.com"
                        className="h-12 border-[#AFA1FD]/30 focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 rounded-xl"
                        required
                      />
                    </div>

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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[#2C293F] font-medium">
                      {editingUser ? "Contraseña (opcional)" : "Contraseña *"}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? "Deja vacío para no cambiar" : "Mínimo 6 caracteres"}
                      className="h-12 border-[#AFA1FD]/30 focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 rounded-xl"
                      required={!editingUser}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-[#2C293F] font-medium">
                        Rol *
                      </Label>
                      <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                        className="w-full h-12 px-4 border border-[#AFA1FD]/30 rounded-xl focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 focus:outline-none bg-white text-[#2C293F]"
                      >
                        <option value="staff">Staff</option>
                        <option value="recepcionista">Recepcionista</option>
                        <option value="administrador">Administrador</option>
                        {user?.role === "dueno" && <option value="dueno">Dueño</option>}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-[#2C293F] font-medium">
                        Local Asignado
                      </Label>
                      <select
                        id="location"
                        value={formData.locationId}
                        onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                        className="w-full h-12 px-4 border border-[#AFA1FD]/30 rounded-xl focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 focus:outline-none bg-white text-[#2C293F]"
                      >
                        <option value="">Sin asignar</option>
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>
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
                      Usuario activo
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
                    onClick={handleSaveUser}
                    className="flex-1 h-12 bg-[#2C293F] text-white hover:brightness-110 rounded-xl"
                    disabled={
                      !formData.name ||
                      !formData.email ||
                      !formData.phone ||
                      (!editingUser && !formData.password)
                    }
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingUser ? "Guardar Cambios" : "Crear Usuario"}
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
