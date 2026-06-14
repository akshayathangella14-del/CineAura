// CineAura Sidebar Navigation
// Collapsible sidebar with nav links and aura accent
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Search,
  Bookmark,
  User,
  Sparkles,
  Route,
  Shield,
  X,
  Lock,
} from 'lucide-react'
import useUiStore from '../../store/uiStore'
import useAuthStore from '../../store/authStore'
import { ROUTES } from '../../utils/constants'
import Logo from '../common/Logo'
import './Sidebar.css'

const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: ROUTES.HOME },
  { label: 'Search', icon: Search, path: ROUTES.SEARCH },
  { label: 'Watchlist', icon: Bookmark, path: ROUTES.WATCHLIST, auth: true },
  { label: 'Your Aura', icon: Sparkles, path: ROUTES.AURA, auth: true },
  { label: 'Journey', icon: Route, path: ROUTES.JOURNEY, auth: true },
  { label: 'Profile', icon: User, path: ROUTES.PROFILE, auth: true },
]

const ADMIN_ITEM = { label: 'Admin', icon: Shield, path: ROUTES.ADMIN }

const sidebarVariants = {
  open: {
    x: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  closed: {
    x: '-100%',
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const overlayVariants = {
  open: { opacity: 1, transition: { duration: 0.25 } },
  closed: { opacity: 0, transition: { duration: 0.2 } },
}

const itemVariants = {
  open: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.05 * i + 0.1, duration: 0.3, ease: 'easeOut' },
  }),
  closed: {
    opacity: 0,
    x: -12,
    transition: { duration: 0.15 },
  },
}

const Sidebar = () => {
  const isSidebarOpen = useUiStore((s) => s.isSidebarOpen)
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)
  const openAuthModal = useUiStore((s) => s.openAuthModal)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  const closeSidebar = () => setSidebarOpen(false)

  // Filter nav items: hide Profile for guests, but show Aura/Journey/Watchlist locked
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.label === 'Profile') return isAuthenticated
    return true
  })
  const showAdmin = isAuthenticated && user?.role === 'ADMIN'

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            className="sidebar__overlay"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={closeSidebar}
            id="sidebar-overlay"
          />

          {/* Sidebar panel */}
          <motion.aside
            className="sidebar"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            id="sidebar"
            role="navigation"
            aria-label="Main navigation"
          >
            {/* Header */}
            <div className="sidebar__header">
              <Logo size="md" />
              <button
                className="sidebar__close-btn"
                onClick={closeSidebar}
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="sidebar__nav">
              <ul className="sidebar__list">
                {visibleItems.map((item, i) => {
                  const isLocked = item.auth && !isAuthenticated
                  
                  return (
                    <motion.li
                      key={item.path}
                      custom={i}
                      variants={itemVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                    >
                      {isLocked ? (
                        <button
                          type="button"
                          className="sidebar__link sidebar__link--locked"
                          onClick={() => {
                            closeSidebar()
                            openAuthModal()
                          }}
                        >
                          <span className="sidebar__link-icon">
                            <Lock size={16} strokeWidth={2} />
                          </span>
                          <span className="sidebar__link-label">{item.label}</span>
                          <span className="sidebar__link-indicator" />
                        </button>
                      ) : (
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                          }
                          onClick={closeSidebar}
                          end={item.path === '/'}
                        >
                          <span className="sidebar__link-icon">
                            <item.icon size={19} strokeWidth={1.8} />
                          </span>
                          <span className="sidebar__link-label">{item.label}</span>
                          <span className="sidebar__link-indicator" />
                        </NavLink>
                      )}
                    </motion.li>
                  )
                })}

                {/* Admin link */}
                {showAdmin && (
                  <motion.li
                    custom={visibleItems.length}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <div className="sidebar__divider" />
                    <NavLink
                      to={ADMIN_ITEM.path}
                      className={({ isActive }) =>
                        `sidebar__link sidebar__link--admin ${isActive ? 'sidebar__link--active' : ''}`
                      }
                      onClick={closeSidebar}
                    >
                      <span className="sidebar__link-icon">
                        <ADMIN_ITEM.icon size={19} strokeWidth={1.8} />
                      </span>
                      <span className="sidebar__link-label">{ADMIN_ITEM.label}</span>
                      <span className="sidebar__link-indicator" />
                    </NavLink>
                  </motion.li>
                )}
              </ul>
            </nav>

            {/* Footer accent glow */}
            <div className="sidebar__footer-glow" />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default Sidebar
