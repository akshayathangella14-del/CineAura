// CineAura Section Header
// Reusable title row with optional "See All" link
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import './SectionHeader.css'

const SectionHeader = ({ title, subtitle, linkTo, linkText = 'See All', icon: Icon }) => {
  return (
    <motion.div
      className="section-header"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="section-header__left">
        {Icon && (
          <span className="section-header__icon">
            <Icon size={20} strokeWidth={1.8} />
          </span>
        )}
        <div className="section-header__text">
          <h2 className="section-header__title">{title}</h2>
          {subtitle && <p className="section-header__subtitle">{subtitle}</p>}
        </div>
      </div>

      {linkTo && (
        <Link to={linkTo} className="section-header__link">
          <span>{linkText}</span>
          <ChevronRight size={16} />
        </Link>
      )}
    </motion.div>
  )
}

export default SectionHeader
