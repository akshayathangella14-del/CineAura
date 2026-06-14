// CineAura Logo — Aura Reel
// Symbol: a film reel disc — three spool windows around a glowing core —
// with a curling film strip trailing from it, its perforations rendered
// as soft glowing dots.
// The reel = unmistakably cinema, the medium itself.
// The glowing core = your cinematic identity, the light at the center.
// The strip + dots = the reel of films winding through your discovery.
// Reads as "film reel" at a glance, but rendered in light rather than
// flat black plastic — premium, not stock.

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '../../utils/constants'
import './Logo.css'

// ─── SVG Mark ───────────────────────────────────────────────────────────────
// Drawn on a 40×32 viewBox. The reel disc is centered at (16,16) on the
// same 32×32 grid as previous marks (so optical alignment with the
// wordmark is preserved); the film strip extends into the extra
// horizontal space toward the right.
// Architecture:
//   1. Ambient glow — soft halo behind the core
//   2. Film strip — curling ribbon trailing from the reel, with
//      glowing perforation dots
//   3. Reel disc — dark disc body
//   4. Spool windows — three cut-out windows around the hub
//   5. Core — the bright hub at center, the light source

const AuraReelMark = () => (
  <svg
    className="logo__svg"
    viewBox="-4 -4 48 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      {/* Ambient core glow — soft halo */}
      <radialGradient id="ca-core" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#F5F0FF" />
        <stop offset="38%"  stopColor="#C4A6FF" />
        <stop offset="100%" stopColor="#7C5CFA" stopOpacity="0" />
      </radialGradient>

      {/* Solid core fill — crisp at small sizes */}
      <radialGradient id="ca-core-solid" cx="42%" cy="38%" r="65%">
        <stop offset="0%"   stopColor="#FBF7FF" />
        <stop offset="55%"  stopColor="#C9AEFF" />
        <stop offset="100%" stopColor="#8B6BF2" />
      </radialGradient>

      {/* Reel disc body — deep violet-black */}
      <radialGradient id="ca-reel-body" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#2D2050" />
        <stop offset="100%" stopColor="#1A1230" />
      </radialGradient>

      {/* Reel rim stroke — quiet violet edge */}
      <linearGradient id="ca-rim" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#C9AEFF" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#5B3FBF" stopOpacity="0.4" />
      </linearGradient>

      {/* Film strip body — slightly lighter than the reel for separation */}
      <linearGradient id="ca-strip" x1="14" y1="6" x2="38" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#3A2D6B" />
        <stop offset="100%" stopColor="#2D2050" />
      </linearGradient>

      {/* Sheen — a soft diagonal band of light that sweeps across the disc */}
      <linearGradient id="ca-sheen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="45%"  stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="52%"  stopColor="#FFFFFF" stopOpacity="0.35" />
        <stop offset="60%"  stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>

      {/* Clip the sheen to the reel disc so it never spills outside it */}
      <clipPath id="ca-disc-clip">
        <circle cx="16" cy="16" r="10.5" />
      </clipPath>
    </defs>

    {/* ── 1. Ambient core glow (soft, breathing) — larger spread
        so the aura visibly bleeds past the disc edge ── */}
    <circle
      className="logo__core-glow"
      cx="16" cy="16" r="13"
      fill="url(#ca-core)"
    />

    {/* ── 2. Film strip — curls off the upper-right of the reel,
        perforation dots glow softly along its length. ── */}
    <g className="logo__strip">
      <path
        d="M 21 9
           C 26 6.5, 32 7, 35.5 10.5
           C 38.5 13.5, 38 18, 35 20.5
           L 27 14
           C 25 12.5, 23 11, 21 9 Z"
        fill="url(#ca-strip)"
        opacity="0.9"
      />
      <g className="logo__strip-dots" fill="url(#ca-core-solid)">
        <circle className="logo__strip-dot" cx="25.5" cy="9.5" r="1" />
        <circle className="logo__strip-dot" cx="30" cy="9.8" r="1" />
        <circle className="logo__strip-dot" cx="34" cy="12" r="1" />
        <circle className="logo__strip-dot" cx="35.8" cy="16" r="1" />
      </g>
    </g>

    {/* ── 3. Reel disc body ── */}
    <circle
      cx="16" cy="16" r="10.5"
      fill="url(#ca-reel-body)"
      stroke="url(#ca-rim)"
      strokeWidth="0.7"
    />

    {/* ── 4. Spool windows — three cut-out windows around the hub,
        grouped so they can rotate together like a reel spinning. ── */}
    <g className="logo__spool-group">
      <g fill="#120B22" transform="translate(16 16)">
        <ellipse cx="0" cy="-5.7" rx="2.8" ry="3.3" />
        <ellipse cx="4.9" cy="2.85" rx="2.8" ry="3.3" transform="rotate(120 4.9 2.85)" />
        <ellipse cx="-4.9" cy="2.85" rx="2.8" ry="3.3" transform="rotate(-120 -4.9 2.85)" />
      </g>
    </g>

    {/* ── 5. Sheen — a slow diagonal glint sweeping across the disc,
        like light catching glass. Clipped so it stays within the reel. ── */}
    <g clipPath="url(#ca-disc-clip)">
      <rect
        className="logo__sheen"
        x="-20" y="0" width="20" height="32"
        fill="url(#ca-sheen)"
      />
    </g>

    {/* ── 6. Core — the hub, the light at the center ── */}
    <circle
      className="logo__core"
      cx="16" cy="16" r="4.2"
      fill="url(#ca-core-solid)"
    />
    {/* ── 7. Sparkles — small twinkling stars scattered around the
        mark, the aura "popping" with discovery. Each twinkles on
        its own staggered rhythm. ── */}
    <g className="logo__sparkles" fill="url(#ca-core-solid)">
      <path className="logo__sparkle logo__sparkle-1"
        d="M 4 1.5 L 4.7 3.3 L 6.5 4 L 4.7 4.7 L 4 6.5 L 3.3 4.7 L 1.5 4 L 3.3 3.3 Z" />
      <path className="logo__sparkle logo__sparkle-2"
        d="M 38.5 2 L 39 3.2 L 40.2 3.7 L 39 4.2 L 38.5 5.4 L 38 4.2 L 36.8 3.7 L 38 3.2 Z" />
      <path className="logo__sparkle logo__sparkle-3"
        d="M 30 27.5 L 30.55 28.85 L 31.9 29.4 L 30.55 29.95 L 30 31.3 L 29.45 29.95 L 28.1 29.4 L 29.45 28.85 Z" />
      <path className="logo__sparkle logo__sparkle-4"
        d="M 5.5 24 L 6 25.1 L 7.1 25.6 L 6 26.1 L 5.5 27.2 L 5 26.1 L 3.9 25.6 L 5 25.1 Z" />
    </g>
  </svg>
)

// ─── Logo Component ──────────────────────────────────────────────────────────

const Logo = ({
  size = 'md',
  linkTo = ROUTES.HOME,
  showTagline = false,
}) => {
  const sizeClass = {
    sm: 'logo--sm',
    md: 'logo--md',
    lg: 'logo--lg',
    xl: 'logo--xl',
  }[size] ?? 'logo--md'

  return (
    <Link
      to={linkTo}
      className={`logo ${sizeClass}`}
      id="cineaura-logo"
    >
      {/* Icon mark — motion wrapper for hover scale + lift */}
      <motion.div
        className="logo__mark"
        whileHover={{ scale: 1.05, y: -1 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Ambient bloom — CSS-controlled opacity on hover */}
        <div className="logo__ambient" aria-hidden="true" />

        <AuraReelMark />
      </motion.div>

      {/* Wordmark */}
      <div className="logo__text">
        <span className="logo__name">
          <span className="logo__name-cine">Cine</span>
          <span className="logo__name-aura">Aura</span>
        </span>
        {showTagline && (
          <span className="logo__tagline">Your Cinematic Aura, Decoded.</span>
        )}
      </div>
    </Link>
  )
}

export default Logo