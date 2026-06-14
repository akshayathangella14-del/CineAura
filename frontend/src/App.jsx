// CineAura App Component
// Root application component — renders routes, restores session on load
import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import useAuthStore from './store/authStore'
import AuthModal from './components/auth/AuthModal'
import './App.css'

function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession)

  // Restore user session from localStorage + validate with backend
  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  return (
    <div id="cineaura-app">
      <AppRoutes />
      <AuthModal />
    </div>
  )
}

export default App
