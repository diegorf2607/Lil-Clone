import Image from "next/image"
import { Instagram, Facebook, Twitter, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white text-[#2C293F] py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Column 1 - Brand */}
          <div className="space-y-4">
            <Image src="/lila-logo.png" alt="Lilá" width={100} height={32} className="h-8 w-auto" />
            <p className="text-[#2C293F]/70 text-sm leading-relaxed">
              La plataforma todo-en-uno para salones, nails, peluquerías, spas y más. Más reservas, menos caos
              administrativo.
            </p>
          </div>

          {/* Column 2 - Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4" />
                <a href="mailto:lilalifestyle25@gmail.com" className="text-[#2C293F]/70 hover:text-[#AFA1FD] transition-colors">
                  lilalifestyle25@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4" />
                <span className="text-[#2C293F]/70">+51 943 852 021</span>
              </li>
            </ul>
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
