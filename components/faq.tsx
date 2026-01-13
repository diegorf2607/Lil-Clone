"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "¿Cuánto tiempo toma implementar Lilá?",
      answer:
        "La mayoría de nuestros clientes están funcionando en menos de 7 días. El proceso incluye configuración inicial, importación de datos, capacitación del equipo y pruebas. Nuestro equipo te acompaña en cada paso.",
    },
    {
      question: "¿Puedo migrar mis datos actuales?",
      answer:
        "Sí, absolutamente. Podemos importar tu base de clientes, historial de citas y servicios desde hojas de cálculo, otros sistemas o manualmente. El proceso es guiado y sin costo adicional.",
    },
    {
      question: "¿Qué pasa si tengo varias sucursales?",
      answer:
        "Nuestro plan Multi-sede está diseñado específicamente para cadenas. Puedes gestionar todas tus sucursales desde una sola cuenta, con reportes consolidados, inventario compartido y control centralizado.",
    },
    {
      question: "¿Puedo usarlo desde el celular?",
      answer:
        "Sí, Lilá funciona perfectamente en cualquier dispositivo: computadora, tablet o celular. Tu equipo puede ver la agenda, registrar citas y procesar pagos desde cualquier lugar.",
    },
    {
      question: "¿Qué tipo de soporte ofrecen?",
      answer:
        "Todos los planes incluyen soporte por email. Los planes Pro y Multi-sede tienen soporte prioritario.",
    },
    {
      question: "¿Hay contrato de permanencia?",
      answer:
        "No, todos nuestros planes son mensuales sin compromiso de permanencia. Puedes cancelar cuando quieras. Estamos seguros de que Lilá te va a encantar.",
    },
  ]

  return (
    <section id="faq" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">Preguntas frecuentes</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-border rounded-lg overflow-hidden bg-card">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-accent/50 transition-colors"
              >
                <span className="font-semibold text-lg pr-8">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-muted-foreground leading-relaxed">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
