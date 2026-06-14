// CineAura Top Navbar
// Premium navigation bar with logo, search, and user area
// Integrates with authStore for login/logout state
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Bell, User, LogOut, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../common/Logo'
import SearchBar from '../common/SearchBar'
import useUiStore from '../../store/uiStore'
import useAuthStore from '../../store/authStore'
import { ROUTES } from '../../utils/constants'
import './TopNavbar.css'

const TopNavbar = () => {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const openAuthModal = useUiStore((s) => s.openAuthModal)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const logoutUser = useAuthStore((s) => s.logoutUser)
  const navigate = useNavigate()

  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handleLogout = async () => {
    setShowMenu(false)
    await logoutUser()
    navigate(ROUTES.HOME)
  }

  // Determine avatar source from backend UserModel fields
  const avatarSrc = user?.avatarImage || user?.profileImageUrl || null
  const userName = user?.username || user?.name || 'User'

  return (
    <motion.header
      className="top-navbar"
      id="top-navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Left section */}
      <div className="top-navbar__left">
        <button
          className="top-navbar__menu-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          id="sidebar-toggle"
        >
          <Menu size={20} />
        </button>
        <Logo size="sm" />
      </div>

      {/* Center section — Search */}
      <div className="top-navbar__center">
        <SearchBar />
      </div>

      {/* Right section — Actions */}
      <div className="top-navbar__right">
        {isAuthenticated ? (
          <>
            <button className="top-navbar__action-btn" aria-label="Notifications" id="notifications-btn">
              <Bell size={19} />
              <span className="top-navbar__badge" />
            </button>

            {/* Avatar + Dropdown */}
            <div className="top-navbar__avatar-wrapper" ref={menuRef}>
              <button
                className="top-navbar__avatar"
                onClick={() => setShowMenu(!showMenu)}
                id="user-avatar-btn"
                aria-label="User menu"
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={userName}
                    className="top-navbar__avatar-img"
                  />
                ) : (
                  <div className="top-navbar__avatar-fallback">
                    <User size={18} />
                  </div>
                )}
                <span className="top-navbar__avatar-ring" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    className="top-navbar__dropdown"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="top-navbar__dropdown-header">
                      <span className="top-navbar__dropdown-name">{userName}</span>
                      <span className="top-navbar__dropdown-email">{user?.email}</span>
                    </div>
                    <div className="top-navbar__dropdown-divider" />
                    <Link to={ROUTES.PROFILE} className="top-navbar__dropdown-item" onClick={() => setShowMenu(false)}>
                      <User size={15} />
                      <span>Profile</span>
                    </Link>
                    <Link to={ROUTES.AURA} className="top-navbar__dropdown-item" onClick={() => setShowMenu(false)}>
                      <Sparkles size={15} />
                      <span>Your Aura</span>
                    </Link>
                    <div className="top-navbar__dropdown-divider" />
                    <button className="top-navbar__dropdown-item top-navbar__dropdown-item--danger" onClick={handleLogout}>
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="top-navbar__auth-links">
            <button className="top-navbar__login-btn" id="login-link" onClick={openAuthModal}>
              Sign In
            </button>
          </div>
        )}
      </div>
    </motion.header>
  )
}

export default TopNavbar
