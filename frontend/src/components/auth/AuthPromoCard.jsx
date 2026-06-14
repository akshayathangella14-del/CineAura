import { useEffect, useRef } from 'react'
import { Sparkles, Bookmark, TrendingUp } from 'lucide-react'
import useUiStore from '../../store/uiStore'
import './AuthPromoCard.css'

const STAR_POSITIONS = [
  [8, 12, 2], [18, 25, 1.5], [30, 8, 2.5], [45, 40, 1.5], [60, 15, 2],
  [72, 55, 1.5], [85, 20, 2], [92, 38, 1.5], [15, 65, 2], [28, 78, 1.5],
  [42, 60, 2.5], [55, 85, 1.5], [68, 72, 2], [78, 48, 1.5], [90, 80, 2],
  [5, 90, 1.5], [35, 30, 2], [50, 50, 1.5], [65, 35, 2], [80, 62, 2.5],
  [22, 45, 1.5], [48, 22, 2], [75, 88, 1.5], [10, 50, 2],
]

const AuthPromoCard = () => {
  const openAuthModal = useUiStore((s) => s.openAuthModal)
  const starsRef = useRef(null)

  useEffect(() => {
    const container = starsRef.current
    if (!container) return

    STAR_POSITIONS.forEach(([left, top, size]) => {
      const el = document.createElement('div')
      el.className = 'auth-promo-card__star'
      el.style.cssText = [
        `left:${left}%`,
        `top:${top}%`,
        `width:${size}px`,
        `height:${size}px`,
        `--star-d:${(2.5 + Math.random() * 3.5).toFixed(1)}s`,
        `--star-dl:${(Math.random() * 4).toFixed(1)}s`,
      ].join(';')
      container.appendChild(el)
    })

    return () => { container.innerHTML = '' }
  }, [])

  return (
    <section className="auth-promo-wrapper">
      <div className="auth-promo-card">
        {/* Atmosphere */}
        <div className="auth-promo-card__orb auth-promo-card__orb--1" />
        <div className="auth-promo-card__orb auth-promo-card__orb--2" />
        <div className="auth-promo-card__orb auth-promo-card__orb--3" />
        <div className="auth-promo-card__scanline" />
        <div className="auth-promo-card__stars" ref={starsRef} />

        {/* Content */}
        <div className="auth-promo-card__content">
          <div className="auth-promo-card__icon">
            <Sparkles size={26} strokeWidth={1.5} />
          </div>

          <div className="auth-promo-card__eyebrow">Personalized for you</div>

          <h2 className="auth-promo-card__title">
            Discover Your<br />
            <em>Cinematic Aura</em>
          </h2>

          <p className="auth-promo-card__desc">
            Build your watchlist, unlock AI-powered recommendations, and let your taste shape every discovery.
          </p>

          <div className="auth-promo-card__features">
            <div className="auth-promo-card__feat">
              <Bookmark size={13} strokeWidth={2} className="auth-promo-card__feat-icon" />
              Watchlist
            </div>
            <div className="auth-promo-card__feat">
              <Sparkles size={13} strokeWidth={2} className="auth-promo-card__feat-icon" />
              Smart picks
            </div>
            <div className="auth-promo-card__feat">
              <TrendingUp size={13} strokeWidth={2} className="auth-promo-card__feat-icon" />
              Track your journey
            </div>
          </div>

          <button
            type="button"
            className="auth-promo-card__btn"
            onClick={openAuthModal}
          >
            Unlock CineAura
          </button>
        </div>
      </div>
    </section>
  )
}

export default AuthPromoCard