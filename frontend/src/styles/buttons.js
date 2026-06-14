// CineAura Button Style Presets
import colors from './colors'
import typography from './typography'
import spacing from './spacing'

const buttons = {
  // Base button styles (shared by all variants)
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.semiBold,
    fontSize: typography.sizes.body,
    lineHeight: 1,
    border: 'none',
    borderRadius: spacing.radius.lg,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    outline: 'none',
  },

  // Sizes
  sizes: {
    sm: {
      padding: `${spacing.sm} ${spacing.md}`,
      fontSize: typography.sizes.meta,
    },
    md: {
      padding: `${spacing.sm} ${spacing.lg}`,
      fontSize: typography.sizes.body,
    },
    lg: {
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: typography.sizes.cardTitle,
    },
  },

  // Variants
  primary: {
    backgroundColor: colors.primaryAccent,
    color: colors.textPrimary,
  },

  secondary: {
    backgroundColor: colors.elevatedSurface,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
  },

  ghost: {
    backgroundColor: 'transparent',
    color: colors.textSecondary,
  },

  danger: {
    backgroundColor: colors.error,
    color: colors.textPrimary,
  },

  // Hover states (apply via onMouseEnter/onMouseLeave or CSS)
  hover: {
    primary: {
      backgroundColor: colors.primaryGlow,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderColor: colors.primaryAccent,
    },
    ghost: {
      color: colors.textPrimary,
      backgroundColor: colors.elevatedSurface,
    },
    danger: {
      backgroundColor: '#DC2626',
    },
  },
}

export default buttons
