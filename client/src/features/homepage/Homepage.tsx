import About from './About.tsx'
import Comparison from './Comparison.tsx'
import Features from './Features.tsx'
import Hero from './Hero.tsx'
import Navbar from './Navbar.tsx'
import './homepage.css'

// The pre-login homepage. One CSS file for the whole feature, imported here.
function Homepage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Comparison />
        <About />
      </main>
    </>
  )
}

export default Homepage
