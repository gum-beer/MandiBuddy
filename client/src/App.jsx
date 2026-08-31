import { useCallback, useEffect, useState } from 'react'
import NavBar from './components/NavBar'
import Hero from './components/Hero'
import Features from './components/Features'
import Comparison from './components/Comparison'
import About from './components/About'
import Footer from './components/Footer'
import CalculatorPanel from './components/CalculatorPanel'
import { APP_LINKS } from './config'
import './App.css'

export default function App() {
  const [calcOpen, setCalcOpen] = useState(false)
  const [toast, setToast] = useState('')

  // Sign in / sign up hand off to the main application. Until those routes
  // exist (set them in src/config.js) the button says so instead.
  const go = useCallback((which) => {
    const url = APP_LINKS[which]
    if (url) {
      window.location.assign(url)
      return
    }
    setToast(
      which === 'signIn'
        ? 'Sign in is not wired up yet — add the URL in src/config.js'
        : 'Sign up is not wired up yet — add the URL in src/config.js'
    )
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const onSignIn = () => go('signIn')
  const onSignUp = () => go('signUp')

  return (
    <>
      <a className="skip" href="#features">
        Skip to features
      </a>

      <NavBar
        onOpenCalculator={() => setCalcOpen(true)}
        onSignIn={onSignIn}
        onSignUp={onSignUp}
      />

      <main>
        <Hero onSignUp={onSignUp} />
        <Features />
        <Comparison />
        <About />
      </main>

      <Footer onSignIn={onSignIn} onSignUp={onSignUp} />

      <CalculatorPanel open={calcOpen} onClose={() => setCalcOpen(false)} />

      {toast ? (
        <p className="toast" role="status">
          {toast}
        </p>
      ) : null}
    </>
  )
}
