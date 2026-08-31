/* ------------------------------------------------------------------
   Where the homepage hands off to the real application. Both routes
   now exist (see src/pages/), so this always navigates. App.jsx's
   fallback reminder toast is dead unless one of these is blanked again.
   ------------------------------------------------------------------ */

export const APP_LINKS = {
  signIn: '/signin',
  signUp: '/signup',
}

// Base URL of the NestJS API. Override by setting VITE_API_URL when the
// backend isn't running on localhost:3000 (e.g. once it's deployed).
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
