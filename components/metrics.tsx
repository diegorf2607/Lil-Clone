"use client"

import { useEffect, useRef, useState } from "react"
import { TrendingDown, TrendingUp, Calendar, Zap } from "lucide-react"

export function Metrics() {
  const metrics = [
    {
      value: 40,
      prefix: "-",
      suffix: "%",
      label: "Ausencias y no-shows",
      description: "Gracias a recordatorios automáticos",
      color: "from-[#AFA1FD] to-[#8B7FE8]",
      icon: TrendingDown,
    },
    {
      value: 25,
      prefix: "+",
      suffix: "%",
      label: "Ingresos promedio",
      description: "En los primeros 3 meses",
      color: "from-[#DFDBF1] to-[#AFA1FD]",
      icon: TrendingUp,
    },
    {
      value: 3,
      prefix: "",
      suffix: "x",
      label: "Más reservas online",
      description: "Comparado con llamadas telefónicas",
      color: "from-[#AFA1FD] to-[#DFDBF1]",
      icon: Calendar,
    },
    {
      value: 7,
      prefix: "< ",
      suffix: " días",
      label: "Para estar funcionando",
      description: "Implementación rápida y sencilla",
      color: "from-[#8B7FE8] to-[#AFA1FD]",
      icon: Zap,
    },
  ]

  return (
    <section className="relative py-12 lg:py-16 bg-gradient-to-br from-[#2C293F] via-[#2C293F] to-[#3d3a52] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#AFA1FD]/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#DFDBF1]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B7FE8]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4 border border-white/20">
            <Zap className="w-4 h-4" />
            Impacto Real
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white text-balance">
            Resultados que importan
          </h2>
          <p className="text-white/70 text-base lg:text-lg max-w-2xl mx-auto">
            Datos reales de negocios que han transformado su gestión con Lilá
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} index={index} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-white/80 text-lg mb-2">¿Listo para ver estos resultados en tu negocio?</p>
          <p className="text-white/60 text-sm">Únete a cientos de profesionales que ya transformaron su gestión</p>
        </div>
      </div>
    </section>
  )
}

function MetricCard({ metric, index }: { metric: any; index: number }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const Icon = metric.icon

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const increment = metric.value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= metric.value) {
        setCount(metric.value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, metric.value])

  return (
    <div
      ref={cardRef}
      className="group relative"
      style={{
        animation: isVisible ? `fadeInUp 0.6s ease-out ${index * 0.15}s both` : "none",
      }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-br from-[#AFA1FD] via-[#DFDBF1] to-[#8B7FE8] rounded-3xl blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-500 animate-pulse" />

      <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#AFA1FD]/20">
        <div
          className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br ${metric.color} mb-3 group-hover:scale-110 transition-transform duration-500`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>

        <div
          className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r mb-3 ${metric.color} bg-clip-text text-transparent tracking-tight`}
        >
          {metric.prefix}
          {count}
          {metric.suffix}
        </div>

        <div className="relative mb-2">
          <div className="text-lg font-bold text-white leading-tight mb-2">{metric.label}</div>
          <div
            className={`h-1 w-0 bg-gradient-to-r ${metric.color} rounded-full group-hover:w-full transition-all duration-500`}
          />
        </div>

        <div className="text-sm text-white/70 leading-relaxed font-medium">{metric.description}</div>

        <div
          className={`absolute top-4 right-4 w-3 h-3 rounded-full bg-gradient-to-br ${metric.color} opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-pulse`}
        />
        <div
          className={`absolute bottom-4 left-4 w-2 h-2 rounded-full bg-gradient-to-br ${metric.color} opacity-30 group-hover:opacity-80 transition-opacity duration-500 animate-pulse`}
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
