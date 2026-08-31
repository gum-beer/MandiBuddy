/* ------------------------------------------------------------------
   Client-side "session" — just a flag in localStorage. There's no
   token because there's no real auth yet (see server/src/auth):
   sign in only checks a plaintext password match. This is enough to
   gate the app's pages for a demo, nothing more.
   ------------------------------------------------------------------ */

const KEY = 'mandibuddy.user'

export function setSignedInUser(username) {
  localStorage.setItem(KEY, username)
}

export function getSignedInUser() {
  return localStorage.getItem(KEY)
}

export function signOut() {
  localStorage.removeItem(KEY)
}
