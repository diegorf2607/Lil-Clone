import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lilá - Software para Salones, Nails y Spas",
  description:
    "Tu agenda llena, sin desorden en recepción. Plataforma todo-en-uno para reservas online, gestión de clientes y pagos.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${geist.className} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
