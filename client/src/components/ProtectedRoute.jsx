import { Navigate } from 'react-router-dom'
import { getSignedInUser } from '../lib/auth'

/** Gate for pages behind sign in. This is a UI-only gate — there's no
 *  server-side session to check, so it's a placeholder until real
 *  auth exists, not a security boundary. */
export default function ProtectedRoute({ children }) {
  if (!getSignedInUser()) {
    return <Navigate to="/signin" replace />
  }
  return children
}
