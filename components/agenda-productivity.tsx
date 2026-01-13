"use client"

import { Card } from "@/components/ui/card"
import {
  Calendar,
  Bell,
  Users,
  CreditCard,
  BarChart3,
  Clock,
  Scissors,
  Sparkles,
  Hand,
  Flower2,
  Droplet,
} from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

export function AgendaProductivity() {
  const features = [
    {
      icon: Calendar,
      title: "Agenda inteligente",
      description: "Gestiona todas tus citas y horarios del equipo desde una sola vista.",
      gradient: "from-[#AFA1FD] to-[#DFDBF1]",
    },
    {
      icon: Bell,
      title: "Recordatorios automáticos",
      description: "Envía confirmaciones y alertas por WhatsApp o email sin esfuerzo.",
      gradient: "from-[#DFDBF1] to-[#AFA1FD]",
    },
    {
      icon: Users,
      title: "Gestión del equipo",
      description: "Controla la disponibilidad y carga de trabajo de cada colaborador.",
      gradient: "from-[#AFA1FD] via-[#DFDBF1] to-[#AFA1FD]",
    },
    {
      icon: CreditCard,
      title: "Fidelización",
      description: "Recompensa a tus clientes frecuentes y haz seguimiento de sus visitas automáticamente.",
      gradient: "from-[#DFDBF1] to-[#AFA1FD]",
    },
    {
      icon: BarChart3,
      title: "Reportes automáticos",
      description: "Visualiza métricas clave de ocupación, ingresos y cancelaciones.",
      gradient: "from-[#AFA1FD] to-[#DFDBF1]",
    },
    {
      icon: Clock,
      title: "Reservas 24/7",
      description: "Tus clientes reservan online cuando quieran. Tu agenda se llena sola.",
      gradient: "from-[#DFDBF1] via-[#AFA1FD] to-[#DFDBF1]",
    },
  ]

  const industries = [
    { icon: Scissors, name: "Salones de belleza", color: "#AFA1FD" },
    { icon: Sparkles, name: "Barberías", color: "#8B7FE8" },
    { icon: Hand, name: "Nails & manicura", color: "#C5B9FF" },
    { icon: Flower2, name: "Spa y bienestar", color: "#9F93F0" },
    { icon: Droplet, name: "Clínicas estéticas", color: "#B5A9F8" },
  ]

  const duplicatedIndustries = [...industries, ...industries, ...industries]

  return (
    <section className="py-20 bg-gradient-to-b from-white via-[#DFDBF1]/10 to-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-[#AFA1FD]/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#DFDBF1]/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance" style={{ color: "#2C293F" }}>
            Centraliza tu agenda y todo lo que la rodea
          </h2>
          <p className="text-lg text-gray-600">
            Lilá sincroniza reservas, recordatorios, personal y pagos en una sola vista. Todo parte de tu agenda.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        <motion.div
          className="relative py-12 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Background gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#AFA1FD]/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute top-1/2 right-1/4 w-64 h-64 bg-[#DFDBF1]/30 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
            />
          </div>

          <div className="text-center mb-8 relative z-10">
            <motion.h3
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ color: "#2C293F" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Funciona igual de bien para…
            </motion.h3>
            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-[#AFA1FD] to-[#DFDBF1] mx-auto rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
            />
          </div>

          {/* Infinite scrolling carousel */}
          <div className="relative">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <motion.div
              className="flex gap-6"
              animate={{
                x: [0, -1400],
              }}
              transition={{
                x: {
                  duration: 25,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                },
              }}
            >
              {duplicatedIndustries.map((industry, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 relative group cursor-pointer"
                  whileHover={{ scale: 1.1, y: -8 }}
                  style={{ perspective: 1000 }}
                >
                  <motion.div
                    className="relative px-8 py-4 bg-white rounded-2xl border-2 border-[#DFDBF1] overflow-hidden"
                    whileHover={{
                      borderColor: industry.color,
                      rotateX: 10,
                      rotateY: 10,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Animated gradient background */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${industry.color}15, ${industry.color}05)`,
                      }}
                    />

                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{
                        x: "100%",
                        transition: { duration: 0.6 },
                      }}
                    />

                    {/* Glow effect */}
                    <motion.div
                      className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${industry.color}40, ${industry.color}20)`,
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex items-center gap-3">
                      <motion.div
                        className="p-2 bg-gradient-to-br from-[#AFA1FD]/10 to-[#DFDBF1]/10 rounded-lg"
                        whileHover={{
                          rotate: [0, -10, 10, -10, 0],
                          scale: [1, 1.1, 1.1, 1.1, 1],
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <industry.icon className="h-5 w-5" style={{ color: industry.color }} />
                      </motion.div>
                      <span className="text-base font-semibold whitespace-nowrap" style={{ color: "#2C293F" }}>
                        {industry.name}
                      </span>
                    </div>

                    {/* Floating particles on hover */}
                    <motion.div
                      className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100"
                      style={{ backgroundColor: industry.color }}
                      animate={{
                        y: [-10, -20],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    />
                    <motion.div
                      className="absolute bottom-2 left-2 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100"
                      style={{ backgroundColor: industry.color }}
                      animate={{
                        y: [10, 20],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: 0.3,
                      }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Decorative elements */}
          <div className="flex justify-center gap-2 mt-8">
            {industries.map((industry, index) => (
              <motion.div
                key={index}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: industry.color }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        y: -8,
        rotateX: 5,
        rotateY: 5,
      }}
      style={{ perspective: 1000 }}
    >
      <Card className="group p-6 h-full transition-all duration-500 border-[#DFDBF1] hover:border-[#AFA1FD] bg-white/80 backdrop-blur-sm relative overflow-hidden hover:shadow-2xl hover:shadow-[#AFA1FD]/20">
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
          animate={
            isHovered
              ? {
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }
              : {}
          }
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />

        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${feature.gradient} blur-sm opacity-30`} />
        </div>

        {isHovered && (
          <>
            <motion.div
              className="absolute top-4 right-4 w-2 h-2 bg-[#AFA1FD] rounded-full"
              animate={{
                y: [-20, -40],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-[#DFDBF1] rounded-full"
              animate={{
                y: [20, 40],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }}
            />
          </>
        )}

        <div className="relative z-10">
          <motion.div
            className="p-3 bg-[#AFA1FD]/10 rounded-xl w-fit mb-4 transition-all duration-300 group-hover:bg-[#AFA1FD]/20 relative overflow-hidden"
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              animate={
                isHovered
                  ? {
                      rotate: [0, 360],
                    }
                  : {}
              }
              transition={{ duration: 0.6 }}
            >
              <feature.icon className="h-6 w-6 text-[#AFA1FD]" />
            </motion.div>

            <motion.div
              className="absolute inset-0 bg-[#AFA1FD]/20 rounded-xl"
              animate={
                isHovered
                  ? {
                      scale: [1, 1.5],
                      opacity: [0.5, 0],
                    }
                  : {}
              }
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>

          <h3 className="text-lg font-semibold mb-2 transition-colors duration-300" style={{ color: "#2C293F" }}>
            {feature.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
        </div>
      </Card>
    </motion.div>
  )
}
