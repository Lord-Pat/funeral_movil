import { Navbar1 } from "@/components/ui/navbar-1"
import { HeroPhone } from "@/components/hero-phone"
import { ArrowDown, ArrowUpRight, Mouse } from "lucide-react"
import { ForgottenDrawer } from "@/components/forgotten-drawer"
import { InvisibleProblem } from "@/components/invisible-problem"
import { PhoneMaterials } from "@/components/phone-materials"
import { PhoneFuneral } from "@/components/phone-funeral"
import { FuneralSteps } from "@/components/funeral-steps"
import { SecondLife } from "@/components/second-life"
import { MemorialCard } from "@/components/memorial-card"
import { FinalShutdown } from "@/components/final-shutdown"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <>
    <main className="w-full">
      <section id="hero" aria-label="Hero" className="bg-dark hero-section">
        <header className="absolute inset-x-0 top-0">
          <Navbar1 />
        </header>
        <div className="hero-layout">
          <div className="hero-intro">
            <p className="hero-eyebrow">
              UN FUNERAL PARA TU ANTIGUO SMARTPHONE
            </p>
            <h1 className="hero-title">
              Tu móvil ha muerto.
              <br />
              Que no muera el planeta con él.
            </h1>
          </div>
          <HeroPhone />
          <div className="hero-details">
            <p className="hero-description">
              Ese smartphone que lleva años olvidado en un cajón merece algo
              mejor. Tráelo a nuestro funeral simbólico, despídete de él y
              participa en una experiencia que impulsa la reutilización y el
              reciclaje de móviles.
            </p>
            <div className="hero-actions">
              <a href="#section-7" className="hero-cta hero-cta-primary">
                Apúntate al funeral
                <ArrowUpRight size={19} aria-hidden="true" />
              </a>
              <a href="#section-3" className="hero-cta hero-cta-secondary">
                Descubre la experiencia
                <ArrowDown size={19} aria-hidden="true" />
              </a>
            </div>
          </div>
          <a href="#section-1" className="hero-scroll-cue">
            <Mouse size={26} strokeWidth={1.2} aria-hidden="true" />
            <span>Desliza para conocer mi historia</span>
          </a>
        </div>
      </section>
      <section
        id="section-1"
        aria-labelledby="forgotten-title"
        tabIndex={-1}
        className="bg-light forgotten-section"
      >
        <div className="forgotten-layout">
          <div className="forgotten-copy">
            <p className="forgotten-eyebrow">01 / LOS OLVIDADOS</p>
            <h2 id="forgotten-title">
              Todos tenemos un cementerio tecnológico en casa.
            </h2>
            <p>
              Ese móvil que juraste reparar. El que guardas por las fotos. El
              que cambiaste y nunca volviste a encender.
            </p>
            <p>
              Con el paso del tiempo, acumulamos dispositivos electrónicos que
              podrían reutilizarse o aprovecharse mediante el reciclaje
              tecnológico.
            </p>
          </div>
          <ForgottenDrawer />
          <div className="forgotten-conclusion">
            <p>No todo lo que está olvidado ha dejado de tener valor.</p>
          </div>
        </div>
      </section>
      <InvisibleProblem />
      <PhoneMaterials />
      <PhoneFuneral />
      <FuneralSteps />
      <SecondLife />
      <MemorialCard />
      <FinalShutdown />
    </main>
    <Footer />
    </>
  )
}
