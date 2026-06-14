import { motion, useReducedMotion } from 'framer-motion'

const AuraSectionReveal = ({ children, className = '', delay = 0 }) => {
  const reducedMotion = useReducedMotion()

  return (
    <motion.section
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}

export default AuraSectionReveal
