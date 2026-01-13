"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { CalendarDays, UserCircle, Building2, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProductTour() {
  const features = [
    {
      icon: CalendarDays,
      title: "Agenda inteligente",
      description:
        "Ve la disponibilidad de todo tu equipo, arrastra y suelta citas, y cambia entre vista semanal y mensual. La agenda más intuitiva del mercado.",
      image: "/calendar-scheduling-interface.png",
    },
    {
      icon: UserCircle,
      title: "Ficha de clientes",
      description:
        "Historial completo de visitas, servicios favoritos, preferencias y notas internas. Conoce a tus clientes como nunca antes.",
      image: "/customer-profile-dashboard.jpg",
    },
    {
      icon: Building2,
      title: "Multi-sucursal",
      description:
        "Maneja varias sedes desde una sola cuenta. Reportes consolidados, inventario compartido y gestión centralizada.",
      image: "/multi-location-management.jpg",
    },
    {
      icon: BarChart3,
      title: "Reportes",
      description:
        "Métricas clave como ingresos, servicios más vendidos, ocupación de agenda y rendimiento del equipo. Toma decisiones basadas en datos.",
      image: "/analytics-dashboard-charts.png",
    },
  ]

  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, features.length])

  const handleTabClick = (index: number) => {
    setActiveIndex(index)
    setIsAutoPlaying(false)
  }

  return (
    null
  )
}
