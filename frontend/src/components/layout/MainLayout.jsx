// CineAura Main Layout
// Wraps all authenticated/app pages with Navbar + Sidebar + Footer
// Used for: Home, Search, Profile, Aura, Journey, Watchlist, Movie Details, Admin
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import TopNavbar from './TopNavbar'
import Sidebar from './Sidebar'
import Footer from './Footer'
import './MainLayout.css'

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
}

const MainLayout = () => {
  return (
    <div className="main-layout" id="main-layout">
      {/* Fixed top navigation */}
      <TopNavbar />

      {/* Slide-in sidebar (overlay mode) */}
      <Sidebar />

      {/* Page content area */}
      <main className="main-layout__content">
        <motion.div
          className="main-layout__page"
          initial={pageTransition.initial}
          animate={pageTransition.animate}
          exit={pageTransition.exit}
          transition={pageTransition.transition}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Global footer — appears on all app pages */}
      <Footer />
    </div>
  )
}

export default MainLayout
