import { useEffect, useState } from 'react'
import Landing from './Landing/landing.jsx'
import Login from './Auth/login.jsx'
import Dashboard from './Dashboard/Dashboard.jsx'
import {
  clearSession,
  consumeAuthRedirect,
  logoutSession,
  restoreSession,
  startGoogleLogin,
} from './lib/auth.js'

function App() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState('')
  const [restoring, setRestoring] = useState(true)

  useEffect(() => {
    let active = true
    const handleSessionExpired = () => {
      clearSession()
      setUser(null)
      setAuthError('Your session expired. Please sign in again.')
      setLoginOpen(true)
    }
    window.addEventListener('dot:auth-expired', handleSessionExpired)

    Promise.resolve().then(() => {
      if (!active) return
      const { authError: redirectError } = consumeAuthRedirect()

      if (redirectError) {
        setAuthError(redirectError)
        setLoginOpen(true)
      }

      restoreSession()
        .then((profile) => { if (active) setUser(profile) })
        .finally(() => { if (active) setRestoring(false) })
    })
    return () => {
      active = false
      window.removeEventListener('dot:auth-expired', handleSessionExpired)
    }
  }, [])

  const handleGoogleLogin = () => {
    startGoogleLogin()
  }

  const handleLogout = async () => {
    setAuthError('')
    try {
      await logoutSession()
      clearSession()
      setUser(null)
    } catch {
      setAuthError('Could not reach the server to revoke your session. Please try again.')
      setLoginOpen(true)
    }
  }

  if (restoring) {
    return <main className="grid min-h-screen place-items-center bg-ivory"><img src="/logo.png" alt="Restoring your Dot session" className="h-9 w-auto animate-pulse" /></main>
  }

  return (
    <>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Landing onGetStarted={() => setLoginOpen(true)} user={null} onLogout={handleLogout} />
      )}
      <Login
        key={authError}
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false)
          setAuthError('')
        }}
        onGoogleLogin={handleGoogleLogin}
        initialError={authError}
      />
    </>
  )
}

export default App
