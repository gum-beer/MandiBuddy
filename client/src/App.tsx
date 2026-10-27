import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import SignedInPlaceholder from './features/auth/SignedInPlaceholder.tsx'
import SignInPage from './features/auth/SignInPage.tsx'
import SignUpPage from './features/auth/SignUpPage.tsx'
import Homepage from './features/homepage/Homepage.tsx'

// Pages and the mock signed-in user. The user lives in memory only: a refresh signs you out,
// which is fine until real auth (Q6).
function App() {
  const [user, setUser] = useState<string | null>(null)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<SignInPage onSignIn={setUser} />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/app"
          element={
            user ? (
              <SignedInPlaceholder username={user} onSignOut={() => setUser(null)} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
