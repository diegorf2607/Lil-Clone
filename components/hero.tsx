"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Star, TrendingUp, Sparkles, Clock, Heart } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-60"
          style={{
            background: "radial-gradient(circle, rgba(175, 161, 253, 0.6) 0%, transparent 70%)",
          }}
          animate={{
            y: [0, 50, 0],
            x: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-72 h-72 rounded-full blur-3xl opacity-50"
          style={{
            background: "radial-gradient(circle, rgba(223, 219, 241, 0.8) 0%, transparent 70%)",
          }}
          animate={{
            y: [0, -60, 0],
            x: [0, -40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(175, 161, 253, 0.5) 0%, transparent 70%)",
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-80 h-80 rounded-full blur-3xl opacity-50"
          style={{
            background: "radial-gradient(circle, rgba(223, 219, 241, 0.7) 0%, transparent 70%)",
          }}
          animate={{
            y: [0, 40, 0],
            x: [0, 50, 0],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 14,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            className="text-center lg:text-left space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Badge className="glass-strong text-primary border-0 shadow-xl px-5 py-2.5 pulse-glow relative overflow-hidden">
                <div className="absolute inset-0 shimmer" />
                <Sparkles className="h-4 w-4 mr-2 relative z-10" />
                <span className="relative z-10">Software todo en uno </span>
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-balance"
              style={{ color: "#2C293F" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Tu agenda llena, sin desorden en recepción
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0 text-pretty"
              style={{ color: "#2C293F" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Llena la agenda de tu salón sin vivir pegado al teléfono
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Button
                size="lg"
                className="relative overflow-hidden text-white hover:shadow-2xl text-base px-8 shadow-xl transition-all duration-300 hover:scale-105 hover:brightness-110 border-0"
                style={{ backgroundColor: "#2C293F" }}
                onClick={() => window.open("https://calendly.com/lilalifestyle25/30min", "_blank")}
              >
                <span className="relative z-10 flex items-center gap-2">Agenda una reunión</span>
              </Button>
            </motion.div>

            <motion.p
              className="text-sm text-primary/60 flex items-center justify-center lg:justify-start gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <Heart className="h-4 w-4 text-secondary fill-secondary" />
              Diseñado para salones de belleza, nails, peluquerías, spas y más en Latinoamérica
            </motion.p>
          </motion.div>

          {/* Right Column - Floating Cards with enhanced effects */}
          <div className="relative h-[500px] lg:h-[600px]">
            {/* Main Dashboard Card */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="glass-strong rounded-3xl shadow-2xl p-6 border-2 border-white/40 pulse-glow"
                whileHover={{ scale: 1.02, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-primary">Agenda de Hoy</h3>
                    <Badge className="bg-gradient-to-r from-secondary/30 to-accent/50 text-primary border-0 shadow-md">
                      12 citas
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        time: "10:00",
                        service: "Corte + Color",
                        client: "María González",
                        gradient: "from-purple-100 to-pink-100",
                      },
                      {
                        time: "11:30",
                        service: "Manicura",
                        client: "Ana Rodríguez",
                        gradient: "from-pink-100 to-rose-100",
                      },
                      {
                        time: "14:00",
                        service: "Tratamiento Facial",
                        client: "Laura Martínez",
                        gradient: "from-blue-100 to-purple-100",
                      },
                    ].map((appointment, i) => (
                      <motion.div
                        key={i}
                        className={`flex items-center gap-3 p-3 bg-gradient-to-r ${appointment.gradient} rounded-xl shadow-sm hover:shadow-md transition-shadow`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary/60" />
                          <div className="text-sm font-medium text-primary/80">{appointment.time}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-primary">{appointment.service}</div>
                          <div className="text-xs text-primary/60">{appointment.client}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Card 1 - Calendar */}
            <motion.div
              className="absolute top-8 right-0 w-48"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.div
                className="glass-strong rounded-2xl shadow-xl p-4 border-2 border-white/40"
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.08, rotate: 3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-secondary/40 to-accent/60 rounded-xl shadow-md">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gradient">156</div>
                    <div className="text-xs text-primary/60">Citas este mes</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Card 2 - New Clients */}
            <motion.div
              className="absolute top-32 left-0 w-48"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <motion.div
                className="glass-strong rounded-2xl shadow-xl p-4 border-2 border-white/40"
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 1,
                }}
                whileHover={{ scale: 1.08, rotate: -3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-pink-200 to-purple-200 rounded-xl shadow-md">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gradient">+24</div>
                    <div className="text-xs text-primary/60">Clientes nuevos</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Card 3 - Reviews */}
            <motion.div
              className="absolute bottom-32 right-4 w-48"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <motion.div
                className="glass-strong rounded-2xl shadow-xl p-4 border-2 border-white/40"
                animate={{
                  y: [0, -18, 0],
                }}
                transition={{
                  duration: 6.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                whileHover={{ scale: 1.08, rotate: 3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-xl shadow-md">
                    <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gradient">4.9</div>
                    <div className="text-xs text-primary/60">Calificación</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Card 4 - Revenue */}
            <motion.div
              className="absolute bottom-8 left-8 w-48"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <motion.div
                className="glass-strong rounded-2xl shadow-xl p-4 border-2 border-white/40"
                animate={{
                  y: [0, -14, 0],
                }}
                transition={{
                  duration: 7.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
                whileHover={{ scale: 1.08, rotate: -3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-200 to-emerald-200 rounded-xl shadow-md">
                    <TrendingUp className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gradient">S/12.5k</div>
                    <div className="text-xs text-primary/60">Ingresos del mes</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
