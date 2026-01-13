"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getWhatsAppUrl } from "@/lib/constants/whatsapp"

interface WhatsAppHelpButtonProps {
  message?: string
  className?: string
  variant?: "floating" | "inline"
}

export function WhatsAppHelpButton({ message, className, variant = "floating" }: WhatsAppHelpButtonProps) {
  const handleClick = () => {
    window.open(getWhatsAppUrl(message), "_blank")
  }

  if (variant === "floating") {
    return (
      <Button
        onClick={handleClick}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg bg-[#25D366] hover:bg-[#20BA5A] text-white ${className}`}
        size="icon"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      className={`bg-[#25D366] hover:bg-[#20BA5A] text-white ${className}`}
      variant="default"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Consultar por WhatsApp
    </Button>
  )
}
