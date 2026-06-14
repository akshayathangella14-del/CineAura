// CineAura Animation Presets
// Framer Motion variants — UI_DESIGN_SYSTEM.md: fade, slide, scale, blur reveal
// Avoid: bounce, spin, flashy effects

const animations = {
  // Transition presets
  transition: {
    fast: { duration: 0.2, ease: 'easeOut' },
    normal: { duration: 0.3, ease: 'easeOut' },
    smooth: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    slow: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    spring: { type: 'spring', stiffness: 300, damping: 30 },
  },

  // Fade In
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Slide Up (for page transitions, cards)
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },

  // Slide In from Left
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },

  // Slide In from Right
  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },

  // Scale In (for modals, popups)
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Blur Reveal (for hero sections, cinematic elements)
  blurReveal: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },

  // Stagger container (for lists, grids)
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  },

  // Stagger child item
  staggerItem: {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Card hover (subtle scale + glow per UI_DESIGN_SYSTEM.md)
  cardHover: {
    scale: 1.03,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
}

export default animations
