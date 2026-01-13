"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState<"left" | "right">("right")

  const testimonials = [
    {
      name: "Adriana Oliva",
      business: "Oliv Nutrition",
      location: "Lima",
      image: "/professional-nutritionist-woman.jpg",
      text: "Lilá revolucionó la forma en que manejo las citas de mis pacientes. Ahora puedo enfocarme en lo que realmente importa: ayudar a mis clientes a alcanzar sus metas nutricionales. El sistema de recordatorios automáticos redujo las ausencias a casi cero.",
      rating: 5,
      role: "Nutricionista",
    },
    {
      name: "Rocio Lecca",
      business: "Oliv Nutrition",
      location: "Lima",
      image: "/professional-nutritionist-woman-smiling.jpg",
      text: "Como nutricionista, necesitaba una herramienta que me permitiera gestionar mi agenda de forma eficiente. Lilá superó todas mis expectativas. Mis pacientes adoran poder reservar sus consultas online y recibir recordatorios automáticos.",
      rating: 5,
      role: "Nutricionista",
    },
    {
      name: "Valentina Morales",
      business: "Estudio de Yoga & Wellness",
      location: "Miraflores",
      image: "/yoga-instructor-woman-peaceful.jpg",
      text: "Desde que implementé Lilá en mi estudio, la gestión de clases y sesiones privadas es mucho más sencilla. Mis alumnos pueden ver la disponibilidad en tiempo real y reservar con un solo clic. Ha sido un cambio total para mi negocio.",
      rating: 5,
      role: "Instructora de Yoga",
    },
  ]

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(() => {
      setDirection("right")
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [testimonials.length, isAutoPlaying])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setDirection("left")
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setDirection("right")
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  return (
    <section
      id="casos"
      className="py-12 lg:py-16 relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-current" />
            Testimonios
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-muted-foreground text-base">
            Miles de profesionales confían en Lilá para gestionar sus negocios
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Navigation buttons */}
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-16 z-20 rounded-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background hover:scale-110 transition-all shadow-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-16 z-20 rounded-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background hover:scale-110 transition-all shadow-lg"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <Card className="p-6 lg:p-8 border-border/50 shadow-2xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden relative">
            {/* Decorative quote icon */}
            <Quote className="absolute top-6 right-6 w-12 h-12 text-secondary/10" />

            <div
              key={currentIndex}
              className="flex flex-col items-center text-center space-y-4"
              style={{
                animation: `slideIn${direction === "right" ? "Right" : "Left"} 0.5s ease-out`,
              }}
            >
              {/* Enhanced profile image with ring */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-primary rounded-full blur-md opacity-50 animate-pulse" />
                <img
                  src={testimonials[currentIndex].image || "/placeholder.svg"}
                  alt={testimonials[currentIndex].name}
                  className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover ring-4 ring-secondary/20 shadow-xl"
                />
              </div>

              {/* Animated stars */}
              <div className="flex gap-1">
                {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-secondary text-secondary"
                    style={{
                      animation: `starPop 0.3s ease-out ${i * 0.1}s both`,
                    }}
                  />
                ))}
              </div>

              {/* Quote text with better styling */}
              <div className="relative">
                <p className="text-lg lg:text-xl text-foreground leading-relaxed max-w-2xl text-balance font-medium">
                  "{testimonials[currentIndex].text}"
                </p>
              </div>

              {/* Enhanced author info */}
              <div className="pt-2">
                <div className="font-bold text-lg">{testimonials[currentIndex].name}</div>
                <div className="text-sm text-muted-foreground font-medium">{testimonials[currentIndex].role}</div>
                <div className="text-sm text-secondary flex items-center justify-center gap-1 mt-1">
                  {testimonials[currentIndex].business} • {testimonials[currentIndex].location}
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced dots navigation with progress bars */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false)
                  setDirection(index > currentIndex ? "right" : "left")
                  setCurrentIndex(index)
                }}
                className={`relative h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-12 bg-secondary" : "w-2 bg-border hover:bg-border/70"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              >
                {index === currentIndex && isAutoPlaying && (
                  <div className="absolute inset-0 bg-secondary/40 rounded-full animate-progress" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced trust badges with hover effects */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider font-semibold">Confían en Lilá</p>
          <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8">
            {["Salón Premium", "Beauty Studio", "Nails Express", "Spa Relax", "Estética Pro"].map((brand) => (
              <div
                key={brand}
                className="text-sm font-bold text-muted-foreground/50 hover:text-foreground transition-colors duration-300 cursor-pointer hover:scale-110 transform"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes starPop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes progress {
          from {
            transform: scaleX(0);
            transform-origin: left;
          }
          to {
            transform: scaleX(1);
          }
        }
        .animate-progress {
          animation: progress 6s linear;
        }
      `}</style>
    </section>
  )
}
