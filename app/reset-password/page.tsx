"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Lock, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const router = useRouter()
  const { updatePassword } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    // Check if we have a valid reset token
    const checkToken = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidToken(true)
      } else {
        // Try to get session from hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get("access_token")
        const type = hashParams.get("type")

        if (accessToken && type === "recovery") {
          setIsValidToken(true)
        } else {
          setError("El enlace de recuperación no es válido o ha expirado")
        }
      }
    }

    checkToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    const result = await updatePassword(password)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } else {
      setError(result.error || "Error al actualizar la contraseña")
      setIsLoading(false)
    }
  }

  if (!isValidToken && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#DFDBF1]/20 to-[#AFA1FD]/10">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#AFA1FD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2C293F]/60">Verificando enlace...</p>
        </div>
      </div>
    )
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
        {/* Reset Password Card */}
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
              <h1 className="text-3xl font-bold text-[#2C293F] mb-2">Nueva contraseña</h1>
              <p className="text-[#2C293F]/60">Ingresa tu nueva contraseña</p>
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
                    <p className="text-sm text-green-800 font-medium mb-2">Contraseña actualizada</p>
                    <p className="text-xs text-green-700">
                      Tu contraseña ha sido actualizada exitosamente. Serás redirigido al login...
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#2C293F] font-medium">
                    Nueva contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AFA1FD]" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 border-[#AFA1FD]/30 focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 rounded-xl"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#2C293F] font-medium">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AFA1FD]" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirma tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-11 h-12 border-[#AFA1FD]/30 focus:border-[#AFA1FD] focus:ring-[#AFA1FD]/20 rounded-xl"
                      required
                      minLength={6}
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
                    "Actualizando..."
                  ) : (
                    <>
                      Actualizar contraseña
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-[#AFA1FD] hover:text-[#2C293F] transition-colors font-medium">
                <ArrowLeft className="inline w-4 h-4 mr-1" />
                Volver al login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#DFDBF1]/20 to-[#AFA1FD]/10">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#AFA1FD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2C293F]/60">Cargando...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
