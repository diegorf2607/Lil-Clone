"use client"

import { Card } from "@/components/ui/card"
import { Scissors, Sparkles, Hand, Flower2, Syringe } from "lucide-react"
import { useState } from "react"

export function Industries() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const industries = [
    {
      icon: Scissors,
      title: "Salones de belleza",
      description: "Gestiona cortes, coloración, peinados y tratamientos capilares con facilidad.",
      color: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-600",
      features: ["Agenda de estilistas", "Control de inventario", "Galería de trabajos"],
    },
    {
      icon: Sparkles,
      title: "Barberías",
      description: "Agenda perfecta para cortes masculinos, afeitados y servicios de barbería.",
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-600",
      features: ["Turnos rápidos", "Membresías", "Lista de espera"],
    },
    {
      icon: Hand,
      title: "Nails & manicura",
      description: "Controla citas de manicura, pedicura, uñas acrílicas y diseños especiales.",
      color: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-600",
      features: ["Catálogo de diseños", "Recordatorios", "Programas de lealtad"],
    },
    {
      icon: Flower2,
      title: "Spa y bienestar",
      description: "Masajes, tratamientos corporales y experiencias de relajación organizadas.",
      color: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-600",
      features: ["Paquetes de servicios", "Reservas grupales", "Gestión de terapeutas"],
    },
    {
      icon: Syringe,
      title: "Clínicas estéticas",
      description: "Procedimientos estéticos, tratamientos faciales y consultas médicas.",
      color: "from-indigo-500/20 to-purple-500/20",
      iconColor: "text-indigo-600",
      features: ["Historial médico", "Consentimientos", "Seguimiento post-tratamiento"],
    },
  ]

  return (
    <section id="para-quien" className="py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            Funciona igual de bien para...
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {industries.map((industry, index) => (
            <Card
              key={index}
              className="relative p-6 transition-all duration-500 hover:border-secondary/50 bg-card border-border/50 group cursor-pointer overflow-hidden"
              style={{
                animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${industry.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10">
                <div
                  className={`p-3 bg-accent rounded-xl w-fit mb-4 group-hover:bg-secondary/20 transition-all duration-500 ${
                    activeIndex === index ? "animate-bounce-slow" : ""
                  }`}
                  style={{
                    transform: activeIndex === index ? "scale(1.1) rotate(5deg)" : "scale(1) rotate(0deg)",
                    transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  <industry.icon
                    className={`h-6 w-6 transition-all duration-500 ${
                      activeIndex === index ? industry.iconColor : "text-foreground"
                    }`}
                    style={{
                      transform: activeIndex === index ? "rotate(360deg)" : "rotate(0deg)",
                    }}
                  />
                </div>

                <h3 className="text-lg font-semibold mb-2 group-hover:text-secondary transition-colors duration-300">
                  {industry.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{industry.description}</p>

                <div
                  className="space-y-2 overflow-hidden transition-all duration-500"
                  style={{
                    maxHeight: activeIndex === index ? "200px" : "0px",
                    opacity: activeIndex === index ? 1 : 0,
                  }}
                >
                  <div className="pt-4 border-t border-border/50">
                    {industry.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-2 text-xs text-muted-foreground mb-2"
                        style={{
                          animation:
                            activeIndex === index ? `slideInLeft 0.4s ease-out ${featureIndex * 0.1}s both` : "none",
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(175, 161, 253, 0.1), transparent)",
                  animation: activeIndex === index ? "shimmer 2s infinite" : "none",
                }}
              />
            </Card>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
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

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 1s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
