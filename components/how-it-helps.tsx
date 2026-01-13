"use client"

import { Card } from "@/components/ui/card"
import { Calendar, Bell, CreditCard, Megaphone } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

export function HowItHelps() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const features = [
    {
      icon: Calendar,
      title: "Reservas 24/7",
      description:
        "Tus clientes reservan en línea cuando quieran, sin necesidad de llamar. Tu agenda se llena automáticamente.",
      details: [
        "Calendario sincronizado en tiempo real",
        "Confirmación instantánea por WhatsApp",
        "Gestión de múltiples servicios y profesionales",
        "Bloqueo automático de horarios ocupados",
      ],
      color: "from-purple-500/20 to-blue-500/20",
    },
    {
      icon: Bell,
      title: "Recordatorios automáticos",
      description: "Reduce ausencias y cancelaciones de último minuto con recordatorios por WhatsApp y email.",
      details: [
        "Recordatorios 24h antes de la cita",
        "Mensajes personalizables por servicio",
        "Confirmación con un solo clic",
        "Reducción del 70% en ausencias",
      ],
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: CreditCard,
      title: "Pagos e inventario",
      description: "Registra ventas, controla stock de productos y genera reportes financieros en tiempo real.",
      details: [
        "Cobros con tarjeta y transferencia",
        "Control de inventario automático",
        "Reportes de ventas diarios/mensuales",
        "Alertas de stock bajo",
      ],
      color: "from-cyan-500/20 to-teal-500/20",
    },
    {
      icon: Megaphone,
      title: "Marketing y reseñas",
      description: "Campañas simples por WhatsApp/email y gestión de reseñas para atraer más clientes.",
      details: [
        "Campañas automáticas de cumpleaños",
        "Promociones para clientes inactivos",
        "Solicitud automática de reseñas",
        "Integración con redes sociales",
      ],
      color: "from-teal-500/20 to-purple-500/20",
    },
  ]

  return (
    <section id="beneficios" className="py-20 lg:py-32 bg-white relative overflow-hidden">
      <motion.div
        className="absolute top-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        animate={{
          y: [0, 50, 0],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
        animate={{
          y: [0, -40, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance text-primary">
            Todo lo que necesitas para que tu agenda se llene sola
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Lilá centraliza reservas, clientes, pagos y marketing en una sola plataforma fácil de usar.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
            >
              <Card
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative p-6 h-full transition-all duration-500 bg-white/80 backdrop-blur-sm border-secondary/20 cursor-pointer overflow-hidden hover:border-secondary/40"
                style={{
                  transform: hoveredIndex === index ? "translateY(-12px) scale(1.02)" : "translateY(0) scale(1)",
                  boxShadow:
                    hoveredIndex === index
                      ? "0 20px 40px -12px rgba(175, 161, 253, 0.3)"
                      : "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative p-3 bg-secondary/10 rounded-2xl w-fit mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-secondary/20">
                  <feature.icon
                    className="h-6 w-6 text-secondary transition-all duration-500 group-hover:scale-125"
                    style={{
                      animation: hoveredIndex === index ? "bounce 1s ease-in-out infinite" : "none",
                    }}
                  />
                </div>

                <div className="relative">
                  <h3 className="text-xl font-semibold mb-3 text-primary transition-colors duration-300 group-hover:text-secondary">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{feature.description}</p>

                  <div
                    className="space-y-2 overflow-hidden transition-all duration-500"
                    style={{
                      maxHeight: hoveredIndex === index ? "200px" : "0",
                      opacity: hoveredIndex === index ? 1 : 0,
                    }}
                  >
                    <div className="pt-4 border-t border-secondary/20">
                      {feature.details.map((detail, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 mb-2 text-xs text-muted-foreground"
                          style={{
                            animation: hoveredIndex === index ? `slideInLeft 0.3s ease-out ${i * 0.05}s both` : "none",
                          }}
                        >
                          <span className="text-secondary mt-0.5">✓</span>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="mt-4 text-xs font-medium text-secondary transition-all duration-300"
                    style={{
                      opacity: hoveredIndex === index ? 1 : 0,
                      transform: hoveredIndex === index ? "translateY(0)" : "translateY(-10px)",
                    }}
                  >
                    Ver más detalles ↓
                  </div>
                </div>

                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(175, 161, 253, 0.4), transparent)",
                    animation: hoveredIndex === index ? "shimmer 2s infinite" : "none",
                  }}
                />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </section>
  )
}
