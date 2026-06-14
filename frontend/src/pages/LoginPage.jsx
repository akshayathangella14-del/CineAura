// CineAura — Login Page
// Premium glassmorphic login form inside AuthLayout
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { ROUTES } from '../utils/constants'
import './LoginPage.css'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const login = useAuthStore((s) => s.login)
  const isLoading = useAuthStore((s) => s.isLoading)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    const result = await login({ email: email.trim(), password })
    if (result.success) {
      toast.success('Welcome back to CineAura!')
      navigate(location.state?.from?.pathname || ROUTES.HOME, { replace: true })
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="login-page" id="page-login">
      <motion.div
        className="login-page__header"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="login-page__title">Welcome Back</h1>
        <p className="login-page__subtitle">Sign in to continue your cinematic journey</p>
      </motion.div>

      <motion.form
        className="login-page__form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Email Field */}
        <div className="login-page__field">
          <label htmlFor="login-email" className="login-page__label">Email</label>
          <div className="login-page__input-wrap">
            <Mail size={17} className="login-page__input-icon" />
            <input
              id="login-email"
              type="email"
              className="login-page__input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError() }}
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="login-page__field">
          <label htmlFor="login-password" className="login-page__label">Password</label>
          <div className="login-page__input-wrap">
            <Lock size={17} className="login-page__input-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="login-page__input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError() }}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="login-page__toggle-pw"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <motion.p
            className="login-page__error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="login-page__submit"
          disabled={isLoading}
          id="login-submit"
        >
          {isLoading ? (
            <span className="login-page__spinner" />
          ) : (
            <>
              <LogIn size={17} />
              <span>Sign In</span>
            </>
          )}
        </button>
      </motion.form>

      {/* Register link */}
      <motion.p
        className="login-page__footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="login-page__link">
          Create one
        </Link>
      </motion.p>
    </div>
  )
}

export default LoginPage
