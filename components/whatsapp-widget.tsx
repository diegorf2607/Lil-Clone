"use client"

import { MessageCircle, X } from 'lucide-react'
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface WhatsAppWidgetProps {
  phoneNumber: string
  businessName?: string
  message?: string
}

export function WhatsAppWidget({ phoneNumber, businessName = "Soporte", message }: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)

  const defaultMessage = message || `Hola ${businessName}, me gustaría obtener más información sobre sus servicios.`

  const handleWhatsAppClick = () => {
    const formattedPhone = phoneNumber.replace(/\D/g, "")
    const encodedMessage = encodeURIComponent(defaultMessage)
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
    setIsOpen(false)
  }

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-2xl flex items-center justify-center transition-all"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-[#25D366] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-[#25D366]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{businessName}</h3>
                    <p className="text-xs text-white/90">En línea</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 bg-[#ECE5DD]">
                <div className="bg-white rounded-lg rounded-bl-none p-4 shadow-sm mb-4">
                  <p className="text-sm text-gray-800">
                    ¡Hola! 👋
                    <br />
                    ¿En qué podemos ayudarte?
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Responde en minutos</p>
                </div>

                <button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Iniciar conversación
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
