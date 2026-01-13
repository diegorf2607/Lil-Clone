"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

export function Pricing() {
  const plans = [
    {
      name: "Esencial",
      description: "Para negocios pequeños",
      price: "Desde S/ 40",
      period: "/mes",
      features: [
        "Reservas online 24/7",
        "Recordatorios automáticos",
        "Hasta 2 profesionales",
        "Gestión de clientes",
        "Reportes básicos",
        "Soporte por email",
      ],
      highlighted: false,
    },
    {
      name: "Pro",
      description: "Negocios en crecimiento",
      price: "Desde S/ 60",
      period: "/mes",
      features: ["Todo lo de Esencial", "Hasta 5 profesionales", "Reportes avanzados", "Soporte prioritario"],
      highlighted: true,
    },
    {
      name: "Multi-sede",
      description: "Para cadenas",
      price: "Personalizado",
      period: "",
      features: [
        "Todo lo de Pro",
        "Sucursales ilimitadas",
        "Profesionales ilimitados",
        "Reportes consolidados",
        "API personalizada",
        "Gerente de cuenta dedicado",
        "Soporte 24/7",
      ],
      highlighted: false,
    },
  ]

  return (
    null
  )
}
