"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Mail, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    const result = await resetPassword(email)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || "Error al enviar el email de recuperación")
    }
    setIsLoading(false)
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
        {/* Forgot Password Card */}
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
              <h1 className="text-3xl font-bold text-[#2C293F] mb-2">Recuperar contraseña</h1>
              <p className="text-[#2C293F]/60">Ingresa tu email para recibir un enlace de recuperación</p>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800 font-medium mb-2">Email enviado</p>
                    <p className="text-xs text-green-700">
                      Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
                      Por favor revisa tu bandeja de entrada y sigue las instrucciones.
                    </p>
                  </div>
                </div>
                <Link href="/login">
                  <Button
                    type="button"
                    className="w-full h-12 bg-[#2C293F] text-white hover:brightness-110 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Volver al login
                  </Button>
                </Link>
              </motion.div>
            ) : (
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

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#2C293F] text-white hover:brightness-110 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    "Enviando..."
                  ) : (
                    <>
                      Enviar enlace de recuperación
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-[#AFA1FD] hover:text-[#2C293F] transition-colors font-medium">
                ← Volver al login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
