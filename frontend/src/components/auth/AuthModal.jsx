import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useUiStore from '../../store/uiStore'
import { ROUTES } from '../../utils/constants'
import './AuthModal.css'

const AuthModal = () => {
  const isAuthModalOpen = useUiStore((s) => s.isAuthModalOpen)
  const closeAuthModal = useUiStore((s) => s.closeAuthModal)
  const navigate = useNavigate()

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isAuthModalOpen, closeAuthModal])

  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isAuthModalOpen])

  if (!isAuthModalOpen) return null

  const handleAction = (path) => {
    closeAuthModal()
    navigate(path)
  }

  return (
    <AnimatePresence>
      <div className="auth-modal-overlay" onClick={closeAuthModal}>
        <motion.div
          className="auth-modal-content"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <button className="auth-modal-close" onClick={closeAuthModal} aria-label="Close">
            <X size={20} />
          </button>

          <div className="auth-modal-icon">
            <Sparkles size={28} />
          </div>

          <h2 className="auth-modal-title">Unlock Your CineAura</h2>
          
          <p className="auth-modal-desc">
            Build your watchlist, discover your Aura, track your cinematic journey, and receive personalized recommendations.
          </p>

          <div className="auth-modal-actions">
            <button 
              className="auth-modal-btn auth-modal-btn--primary"
              onClick={() => handleAction(ROUTES.LOGIN)}
            >
              Sign In
            </button>
            <button 
              className="auth-modal-btn auth-modal-btn--secondary"
              onClick={() => handleAction(ROUTES.REGISTER)}
            >
              Create Account
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AuthModal
