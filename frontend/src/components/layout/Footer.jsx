// CineAura Footer
// Premium cinematic footer — brand, navigation, cinematic experience
// Uses existing design tokens, framer-motion patterns, and route constants
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  Search,
  TrendingUp,
  Flame,
  User,
  Route,
  Sparkles,
  Clapperboard,
  Compass,
  MessageCircle,
  Trophy,
} from 'lucide-react'
import Logo from '../common/Logo'
import { ROUTES } from '../../utils/constants'
import './Footer.css'

// ─── Animation Variants ─────────────────────────────────────────────────────
// Match the stagger + slideUp pattern used in Sidebar and pages
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ─── Link Data ──────────────────────────────────────────────────────────────
// Only routes that actually exist in AppRoutes.jsx
const EXPLORE_LINKS = [
  { label: 'Discover', path: ROUTES.HOME, icon: Home },
  { label: 'Search', path: ROUTES.SEARCH, icon: Search },
  { label: 'Trending', path: '/movies/trending', icon: TrendingUp },
  { label: 'Popular', path: '/movies/popular', icon: Flame },
]

const JOURNEY_LINKS = [
  { label: 'Profile', path: ROUTES.PROFILE, icon: User },
  { label: 'Journey', path: ROUTES.JOURNEY, icon: Route },
  { label: 'Your Aura', path: ROUTES.AURA, icon: Sparkles },
]

// ─── Feature highlights for the Cinematic Experience section ────────────────
const FEATURES = [
  { label: 'Personalized Recommendations', icon: Compass },
  { label: 'Movie Journey Tracking', icon: Clapperboard },
  { label: 'Reviews & Reactions', icon: MessageCircle },
  { label: 'Achievement Progress', icon: Trophy },
]

// ─── Footer Component ───────────────────────────────────────────────────────
const Footer = () => {
  return (
    <motion.footer
      className="footer"
      id="cineaura-footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      <div className="footer__inner">
        {/* ── Main Grid ──────────────────── */}
        <div className="footer__grid">

          {/* Section 1 — Brand */}
          <motion.div className="footer__brand" variants={itemVariants}>
            <Logo size="sm" />
            <p className="footer__brand-description">
              Discover movies, build your cinematic identity, and uncover
              stories that match your unique taste.
            </p>
          </motion.div>

          {/* Section 2 — Explore */}
          <motion.div variants={itemVariants}>
            <h3 className="footer__heading">Explore</h3>
            <ul className="footer__links">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer__link">
                    <span className="footer__link-icon">
                      <link.icon size={14} strokeWidth={1.8} />
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Section 3 — Your Journey */}
          <motion.div variants={itemVariants}>
            <h3 className="footer__heading">Your Journey</h3>
            <ul className="footer__links">
              {JOURNEY_LINKS.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer__link">
                    <span className="footer__link-icon">
                      <link.icon size={14} strokeWidth={1.8} />
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Section 4 — Cinematic Experience */}
          <motion.div className="footer__project" variants={itemVariants}>
            <h3 className="footer__heading">Cinematic Experience</h3>
            <p className="footer__project-description">
              Every movie tells a story. CineAura helps you discover yours
              through personalized recommendations, cinematic milestones,
              and meaningful movie exploration.
            </p>
            <ul className="footer__links">
              {FEATURES.map((feature) => (
                <li key={feature.label}>
                  <span className="footer__link">
                    <span className="footer__link-icon">
                      <feature.icon size={14} strokeWidth={1.8} />
                    </span>
                    {feature.label}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── Bottom Bar ─────────────────── */}
        <motion.div className="footer__bottom" variants={itemVariants}>
          <span className="footer__copyright">
            © 2026{' '}
            <span className="footer__copyright-brand">CineAura</span>
          </span>
          <span className="footer__tech">
            Powered by intelligent recommendations and cinematic exploration.
          </span>
        </motion.div>
      </div>
    </motion.footer>
  )
}

export default Footer
