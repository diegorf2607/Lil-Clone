// WhatsApp configuration
export const WHATSAPP_NUMBER = "51999999999" // Placeholder - cambiar por número real

export const WHATSAPP_DEFAULT_MESSAGE = "Hola, tengo una consulta sobre una cita."

export function getWhatsAppUrl(message?: string): string {
  const text = message || WHATSAPP_DEFAULT_MESSAGE
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}
