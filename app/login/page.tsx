"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const success = await login(email, password)

    if (!success) {
      setError("Credenciales incorrectas. Intenta de nuevo.")
      setIsLoading(false)
    }
    // If successful, the login function will redirect automatically
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-[#DFDBF1]/20 to-[#AFA1FD]/10">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-[#AFA1FD]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#DFDBF1]/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#AFA1FD]/20 p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                className="inline-flex items-center justify-center mb-4"
              >
                <Image 
                  src="/lila-logo.png" 
                  alt="Lilá" 
                  width={100} 
                  height={32} 
                  className="h-12 w-auto" 
                  priority 
                />
              </motion.div>
              <h1 className="text-3xl font-bold text-[#2C293F] mb-2">Bienvenido de vuelta</h1>
              <p className="text-[#2C293F]/60">Ingresa a tu cuenta</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#2C293F] font-medium">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AFA1FD]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 border-[#AFA1FD]/30 focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2C293F] font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AFA1FD]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 border-[#AFA1FD]/30 focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 rounded-xl"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Demo: usa dueno@lila.com, admin@lila.com, recepcion@lila.com o staff@lila.com con contraseña
                      "demo123"
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link href="#" className="text-sm text-[#AFA1FD] hover:text-[#2C293F] transition-colors font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#2C293F] text-white hover:brightness-110 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  "Iniciando sesión..."
                ) : (
                  <>
                    Iniciar sesión
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#AFA1FD]/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-[#2C293F]/60">o</span>
              </div>
            </div>

            {/* View Client Button */}
            <Link href="/demo">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-[#AFA1FD]/30 text-[#AFA1FD] hover:bg-[#AFA1FD]/10 hover:border-[#AFA1FD] rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Ver Vista del Cliente
              </Button>
            </Link>
          </div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-6"
          >
            <Link href="/" className="text-[#2C293F]/60 hover:text-[#2C293F] transition-colors text-sm font-medium">
              ← Volver al inicio
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center max-w-md"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-[#AFA1FD]/20">
            <p className="text-sm text-[#2C293F]/70 font-medium mb-2">Credenciales de demo:</p>
            <div className="text-xs text-[#2C293F]/60 space-y-1">
              <p>
                <strong>Dueño:</strong> dueno@lila.com
              </p>
              <p>
                <strong>Admin:</strong> admin@lila.com
              </p>
              <p>
                <strong>Recepción:</strong> recepcion@lila.com
              </p>
              <p>
                <strong>Staff:</strong> staff@lila.com
              </p>
              <p className="mt-2">
                <strong>Contraseña:</strong> demo123
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
