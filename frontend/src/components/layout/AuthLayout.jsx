// CineAura Auth Layout
// Wraps Login and Register pages — cinematic split layout
// Left: ambient glow background (movie backdrop in Phase 2B+)
// Right: glassmorphism form panel
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Logo from '../common/Logo'
import './AuthLayout.css'

const AuthLayout = () => {
  return (
    <div className="auth-layout" id="auth-layout">
      {/* Left side — cinematic ambient panel */}
      <div className="auth-layout__cinematic">
        {/* Ambient glow orbs */}
        <div className="auth-layout__orb auth-layout__orb--primary" />
        <div className="auth-layout__orb auth-layout__orb--secondary" />

        {/* Centered branding */}
        <motion.div
          className="auth-layout__brand"
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Logo size="lg" showTagline />
        </motion.div>

        {/* Subtle grid overlay */}
        <div className="auth-layout__grid" />
      </div>

      {/* Right side — form area */}
      <motion.div
        className="auth-layout__form-panel"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="auth-layout__form-inner">
          {/* Mobile-only logo */}
          <div className="auth-layout__mobile-logo">
            <Logo size="md" showTagline />
          </div>

          {/* Auth page content (Login/Register form) */}
          <Outlet />
        </div>
      </motion.div>
    </div>
  )
}

export default AuthLayout
