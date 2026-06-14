// CineAura Common Styles
// Shared style objects used across multiple components
import colors from './colors'
import spacing from './spacing'

const common = {
  // Full-page container
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: colors.background,
    color: colors.textPrimary,
    padding: spacing.lg,
  },

  // Centered flex container
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Overlay (for modals, image overlays)
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    zIndex: spacing.zIndex.overlay,
  },

  // Glassmorphism panel
  glassPanel: {
    backgroundColor: colors.glassBg,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: spacing.radius.xl,
  },

  // Text truncation (single line)
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // Text truncation (multi-line, 2 lines)
  lineClamp2: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  // Text truncation (multi-line, 3 lines)
  lineClamp3: {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  // Scrollbar styling (for custom scrollbars)
  scrollbar: {
    scrollbarWidth: 'thin',
    scrollbarColor: `${colors.elevatedSurface} ${colors.background}`,
  },

  // Divider line
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: colors.border,
    border: 'none',
  },

  // Badge / Tag
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${spacing.xs} ${spacing.sm}`,
    backgroundColor: colors.elevatedSurface,
    color: colors.textSecondary,
    borderRadius: spacing.radius.full,
    fontSize: '0.75rem',
    fontWeight: 500,
  },

  // Avatar circle
  avatar: {
    borderRadius: spacing.radius.full,
    objectFit: 'cover',
    border: `2px solid ${colors.border}`,
  },
}

export default common
