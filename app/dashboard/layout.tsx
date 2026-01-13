"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Scissors, Calendar, ClipboardList, Settings, LogOut, Menu, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { id: "servicios", icon: Scissors, label: "Servicios", href: "/dashboard/servicios" },
  { id: "calendario", icon: Calendar, label: "Calendario", href: "/dashboard/calendario" },
  { id: "reservas", icon: ClipboardList, label: "Reservas", href: "/dashboard/reservas" },
  { id: "configuracion", icon: Settings, label: "Configuración", href: "/dashboard/configuracion" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const visibleMenuItems = menuItems.filter((item) => {
    // Staff solo ve Dashboard y Mis Citas
    if (user.role === "staff" && !["dashboard", "calendario"].includes(item.id)) {
      return false
    }
    // Reception no ve Configuración
    if (user.role === "recepcionista" && item.id === "configuracion") {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#DFDBF1]/20 to-[#AFA1FD]/10 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-40 h-screen bg-white/80 backdrop-blur-xl border-r border-[#AFA1FD]/20 transition-all duration-300 overflow-y-auto ${
          sidebarOpen ? "w-64" : "w-20"
        } ${!mobileMenuOpen && "hidden lg:flex"} flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#AFA1FD]/20 flex items-center justify-between">
          {sidebarOpen && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#AFA1FD] to-[#DFDBF1] rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#2C293F]">Lilá</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1 hover:bg-[#AFA1FD]/10 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="px-6 py-4 border-b border-[#AFA1FD]/20">
            <p className="text-xs text-[#2C293F]/60 uppercase tracking-wider font-medium">Mi Cuenta</p>
            <h3 className="font-semibold text-[#2C293F] mt-2">{user.name}</h3>
            <p className="text-xs text-[#2C293F]/60 capitalize">{user.role}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/dashboard")
            return (
              <Link key={item.id} href={item.href}>
                <motion.button
                  whileHover={{ x: sidebarOpen ? 4 : 0 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#AFA1FD] to-[#9890E8] text-white shadow-lg"
                      : "text-[#2C293F] hover:bg-[#AFA1FD]/10"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </motion.button>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-[#AFA1FD]/20">
          <Button
            onClick={() => {
              logout()
              setMobileMenuOpen(false)
            }}
            className="w-full bg-[#2C293F] text-white hover:brightness-110 flex items-center gap-2 justify-center"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed lg:hidden top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-xl rounded-lg border border-[#AFA1FD]/20 hover:bg-[#AFA1FD]/10 transition"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
