"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLocalStorageStore } from "@/lib/hooks/use-local-storage-store"
import { CustomersList } from "@/components/customers-list"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BirthdateField } from "@/components/birthdate-field"
import { Plus, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function CustomersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const crmStore = useLocalStorageStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const handleCreateCustomer = () => {
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

    const customerId = `customer_${Date.now()}`
    crmStore.upsertCustomer({
      id: customerId,
      fullName: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      birthdate: formData.birthdate || undefined,
    })

    toast({
      title: "Cliente creado",
      description: `${formData.name} ha sido agregado exitosamente`,
    })

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      birthdate: "",
    })
    setIsCreateModalOpen(false)
  }

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
