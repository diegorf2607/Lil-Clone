"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="relative py-20 bg-gradient-mesh overflow-hidden lg:py-20">
      <motion.div
        className="absolute top-10 left-10 w-96 h-96 rounded-full blur-3xl opacity-50"
        style={{
          background: "radial-gradient(circle, rgba(175, 161, 253, 0.7) 0%, transparent 70%)",
        }}
        animate={{
          y: [0, 60, 0],
          x: [0, 40, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-20 right-20 w-80 h-80 rounded-full blur-3xl opacity-60"
        style={{
          background: "radial-gradient(circle, rgba(223, 219, 241, 0.8) 0%, transparent 70%)",
        }}
        animate={{
          y: [0, -50, 0],
          x: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(175, 161, 253, 0.6) 0%, transparent 70%)",
        }}
        animate={{
          y: [0, -70, 0],
          x: [0, -50, 0],
          scale: [1, 1.4, 1],
        }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-72 h-72 rounded-full blur-3xl opacity-50"
        style={{
          background: "radial-gradient(circle, rgba(223, 219, 241, 0.7) 0%, transparent 70%)",
        }}
        animate={{
          y: [0, 50, 0],
          x: [0, 60, 0],
          scale: [1, 1.25, 1],
        }}
        transition={{
          duration: 14,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center space-y-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass-strong px-5 py-2.5 rounded-full shadow-xl mb-6 pulse-glow relative overflow-hidden">
              <div className="absolute inset-0 shimmer" />
              <Sparkles className="h-4 w-4 text-secondary relative z-10" />
              <span className="text-sm font-medium text-primary relative z-10">
                Únete a cientos de salones exitosos
              </span>
            </div>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-balance"
            style={{ color: "#2C293F" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Llena la agenda de tu salón sin vivir pegado al teléfono
          </motion.h2>

          <motion.p
            className="text-xl text-primary/70 max-w-2xl mx-auto text-pretty"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Automatiza reservas, recordatorios y pagos. Dedica más tiempo a lo que realmente importa: tus clientes.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Button
              size="lg"
              className="relative overflow-hidden text-white hover:shadow-2xl text-base px-8 shadow-xl transition-all duration-300 hover:brightness-110 group"
              style={{ backgroundColor: "#2C293F" }}
              onClick={() => window.open("https://calendly.com/lilalifestyle25/30min", "_blank")}
            >
              <span className="relative z-10 flex items-center gap-2">Agenda una reunión</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass-strong border-2 border-primary/30 text-primary hover:bg-primary/10 text-base px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-transparent"
              onClick={() => (window.location.href = "/demo")}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Ver demo en vivo
              </span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
