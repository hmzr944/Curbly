import { Nav } from './components/nav'
import { Hero } from './components/hero'
import { Pain } from './components/pain'
import { HowItWorks } from './components/how-it-works'
import { Pricing } from './components/pricing'
import { Footer } from './components/footer'

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Pain />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </>
  )
}
