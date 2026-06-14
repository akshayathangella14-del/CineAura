// CineAura Typography
// Font system from UI_DESIGN_SYSTEM.md

const typography = {
  // Font Family
  fontFamily: "'Inter', sans-serif",

  // Font Weights
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
    extraBold: 800,
  },

  // Heading Scale (from UI_DESIGN_SYSTEM.md)
  sizes: {
    hero: '3.5rem',       // 56px
    pageTitle: '2.5rem',  // 40px
    sectionTitle: '1.75rem', // 28px
    cardTitle: '1.125rem',   // 18px
    body: '1rem',            // 16px
    meta: '0.875rem',        // 14px
    small: '0.75rem',        // 12px
  },

  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
    wider: '0.05em',
  },
}

export default typography
