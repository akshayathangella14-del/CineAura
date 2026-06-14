// CineAura — Register Page
// Premium registration form inside AuthLayout
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { ROUTES } from '../utils/constants'
import './RegisterPage.css'

const RegisterPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const register = useAuthStore((s) => s.register)
  const isLoading = useAuthStore((s) => s.isLoading)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    const result = await register({ name: name.trim(), email: email.trim(), password })
    if (result.success) {
      toast.success('Account created! Please sign in.')
      navigate(ROUTES.LOGIN)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="register-page" id="page-register">
      <motion.div
        className="register-page__header"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="register-page__title">Create Account</h1>
        <p className="register-page__subtitle">Join CineAura and discover your cinematic identity</p>
      </motion.div>

      <motion.form
        className="register-page__form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Name Field */}
        <div className="register-page__field">
          <label htmlFor="register-name" className="register-page__label">Name</label>
          <div className="register-page__input-wrap">
            <User size={17} className="register-page__input-icon" />
            <input
              id="register-name"
              type="text"
              className="register-page__input"
              placeholder="Your name"
              value={name}
              onChange={(e) => { setName(e.target.value); clearError() }}
              autoComplete="name"
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="register-page__field">
          <label htmlFor="register-email" className="register-page__label">Email</label>
          <div className="register-page__input-wrap">
            <Mail size={17} className="register-page__input-icon" />
            <input
              id="register-email"
              type="email"
              className="register-page__input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError() }}
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="register-page__field">
          <label htmlFor="register-password" className="register-page__label">Password</label>
          <div className="register-page__input-wrap">
            <Lock size={17} className="register-page__input-icon" />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              className="register-page__input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError() }}
              autoComplete="new-password"
              minLength={6}
              required
            />
            <button
              type="button"
              className="register-page__toggle-pw"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="register-page__field">
          <label htmlFor="register-confirm" className="register-page__label">Confirm Password</label>
          <div className="register-page__input-wrap">
            <Lock size={17} className="register-page__input-icon" />
            <input
              id="register-confirm"
              type={showPassword ? 'text' : 'password'}
              className="register-page__input"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.p
            className="register-page__error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="register-page__submit"
          disabled={isLoading}
          id="register-submit"
        >
          {isLoading ? (
            <span className="register-page__spinner" />
          ) : (
            <>
              <UserPlus size={17} />
              <span>Create Account</span>
            </>
          )}
        </button>
      </motion.form>

      {/* Login link */}
      <motion.p
        className="register-page__footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="register-page__link">
          Sign in
        </Link>
      </motion.p>
    </div>
  )
}

export default RegisterPage
