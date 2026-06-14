// CineAura Card Style Presets
// UI_DESIGN_SYSTEM.md: rounded corners, subtle shadows, smooth hover
import colors from './colors'
import spacing from './spacing'

const cards = {
  // Base card
  base: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },

  // Elevated card (modals, popups)
  elevated: {
    backgroundColor: colors.elevatedSurface,
    borderRadius: spacing.radius.xl,
    border: `1px solid ${colors.border}`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },

  // Movie card
  movie: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  // Glass card (for login panel, overlays)
  glass: {
    backgroundColor: colors.glassBg,
    borderRadius: spacing.radius.xl,
    border: `1px solid ${colors.glassBorder}`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    overflow: 'hidden',
  },

  // Hover styles (per UI_DESIGN_SYSTEM.md: slight scale, slight glow, image zoom)
  hover: {
    base: {
      borderColor: colors.primaryAccent,
      boxShadow: `0 0 20px ${colors.cardHoverGlow}`,
    },
    movie: {
      transform: 'scale(1.03)',
      borderColor: colors.primaryAccent,
      boxShadow: `0 8px 30px ${colors.cardHoverGlow}`,
    },
  },
}

export default cards
