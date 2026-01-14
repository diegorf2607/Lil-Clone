import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { AgendaProductivity } from "@/components/agenda-productivity"
import { ProductTour } from "@/components/product-tour"
import { Metrics } from "@/components/metrics"
import { Pricing } from "@/components/pricing"
import { FAQ } from "@/components/faq"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <AgendaProductivity />
      <ProductTour />
      <Metrics />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
