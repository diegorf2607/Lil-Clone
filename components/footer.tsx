import Image from "next/image"
import { Instagram, Facebook, Twitter, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white text-[#2C293F] py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Column 1 - Brand */}
          <div className="space-y-4">
            <Image src="/lila-logo.png" alt="Lilá" width={100} height={32} className="h-8 w-auto" />
            <p className="text-[#2C293F]/70 text-sm leading-relaxed">
              La plataforma todo-en-uno para salones, nails, peluquerías, spas y más. Más reservas, menos caos
              administrativo.
            </p>
          </div>

          {/* Column 2 - Navigation */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navegación</h3>
            <ul className="space-y-3">
              {[
                { href: "#producto", label: "Producto" },
                { href: "#funcionalidades", label: "Funcionalidades" },
                { href: "#precios", label: "Precios" },
                { href: "#casos", label: "Casos de éxito" },
                { href: "#faq", label: "Preguntas frecuentes" },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-[#2C293F]/70 hover:text-[#AFA1FD] transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4" />
                <a href="mailto:hola@lila.app" className="text-[#2C293F]/70 hover:text-[#AFA1FD] transition-colors">
                  lilalifestyle25@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4" />
                <span className="text-[#2C293F]/70">+51 943 852 021</span>
              </li>
            </ul>

            <div className="flex gap-4 mt-6">
              <a href="#" className="p-2 bg-[#DFDBF1] rounded-lg hover:bg-[#AFA1FD] hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              
              
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-[#2C293F]/10 text-center text-sm text-[#2C293F]/60">
          <p>&copy; {new Date().getFullYear()} Lilá. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
