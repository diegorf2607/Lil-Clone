"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLocalStorageStore } from "@/lib/hooks/use-local-storage-store"
import { CustomersList } from "@/components/customers-list"
import { motion } from "framer-motion"

export default function CustomersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const crmStore = useLocalStorageStore()

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
  )
}
