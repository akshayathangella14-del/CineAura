// CineAura Hero Section — Premium Cinematic Recommendation Showcase
// Architecture preserved: same stores, same props, same data flow
import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Star, Info, TrendingUp, Award, Sparkles, Clock, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useUiStore from '../../store/uiStore'
import useWatchlistStore from '../../store/watchlistStore'
import { formatRating, getImageUrl, getYear, formatRuntime } from '../../utils/formatters'
import LoadingSkeleton from '../common/LoadingSkeleton'
import './HeroSection.css'

// ── Premium rotation cadence: 12 seconds — fast enough to feel alive,
//    slow enough for reading. Netflix uses 8-10s, Disney+ ~10-12s. ──
const ROTATION_INTERVAL = 12000

// ── Derive a dynamic eyebrow label from real metrics ──
function getEyebrowLabel(movie) {
  const now = new Date()
  const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : null
  const daysSinceRelease = releaseDate
    ? Math.floor((now - releaseDate) / (1000 * 60 * 60 * 24))
    : null

  if (daysSinceRelease !== null && daysSinceRelease >= 0 && daysSinceRelease <= 90) {
    return { text: 'New Release Spotlight', icon: Clock }
  }
  if ((movie.popularity || 0) > 100) {
    return { text: 'Trending Now', icon: TrendingUp }
  }
  if ((movie.voteAverage || movie.rating || 0) >= 7.5) {
    return { text: 'Critically Acclaimed', icon: Award }
  }
  if ((movie.voteAverage || movie.rating || 0) >= 7.0 && (movie.voteCount || 0) > 500) {
    return { text: 'Audience Favorite', icon: Users }
  }
  return { text: "Editor's Choice", icon: Sparkles }
}

// ── Generate 2-3 data-driven insight reasons ──
function getInsightReasons(movie) {
  const reasons = []
  const score = movie.voteAverage || movie.rating || 0
  const popularity = movie.popularity || 0
  const voteCount = movie.voteCount || 0
  const genres = (movie.genres || []).map(g => typeof g === 'object' ? g.name : g).filter(Boolean)

  if (popularity > 80) {
    reasons.push({ icon: TrendingUp, text: 'Trending this week' })
  }

  if (score >= 7.0) {
    reasons.push({ icon: Star, text: `${score.toFixed(1)} audience score` })
  }

  if (genres.length > 0 && popularity > 40) {
    reasons.push({ icon: Sparkles, text: `Popular in ${genres[0]}` })
  }

  const now = new Date()
  const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : null
  const daysSinceRelease = releaseDate
    ? Math.floor((now - releaseDate) / (1000 * 60 * 60 * 24))
    : null

  if (daysSinceRelease !== null && daysSinceRelease >= 0 && daysSinceRelease <= 180) {
    reasons.push({ icon: Clock, text: 'Recently released' })
  }

  if (voteCount > 1000) {
    reasons.push({ icon: Users, text: `${(voteCount / 1000).toFixed(1)}k ratings` })
  }

  return reasons.slice(0, 3)
}

// ── Staggered text animation orchestrator ──
const contentVariants = {
  enter: {
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 30, filter: 'blur(8px)' },
  enter: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0, y: -20, filter: 'blur(4px)',
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const titleVariants = {
  initial: { opacity: 0, y: 40, filter: 'blur(12px)', scale: 0.97 },
  enter: {
    opacity: 1, y: 0, filter: 'blur(0px)', scale: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0, y: -25, filter: 'blur(6px)', scale: 0.98,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ── Ambient floating particles ──
const PARTICLE_COUNT = 6
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  size: 2 + Math.random() * 3,
  x: 10 + Math.random() * 80,
  y: 10 + Math.random() * 80,
  duration: 18 + Math.random() * 14,
  delay: Math.random() * 8,
}))

const HeroSection = ({ movie, isLoading = false }) => {
  const movies = Array.isArray(movie) ? movie : [movie].filter(Boolean)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(null)
  const intervalRef = useRef(null)

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const openAuthModal = useUiStore((s) => s.openAuthModal)
  const isWatchlisted = useWatchlistStore((s) => s.isWatchlisted)
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist)

  // ── Rotation + progress bar ──
  useEffect(() => {
    if (movies.length <= 1) return

    const startTime = Date.now()
    progressRef.current = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - startTime
      const pct = Math.min((elapsed / ROTATION_INTERVAL) * 100, 100)
      setProgress(pct)
      if (pct < 100) {
        progressRef.current = requestAnimationFrame(tick)
      }
    })

    intervalRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length)
      setProgress(0)
    }, ROTATION_INTERVAL)

    return () => {
      cancelAnimationFrame(progressRef.current)
      clearTimeout(intervalRef.current)
    }
  }, [currentIndex, movies.length])

  const goToSlide = useCallback((index) => {
    setProgress(0)
    setCurrentIndex(index)
  }, [])

  if (isLoading) {
    return <LoadingSkeleton variant="hero" />
  }

  const activeMovie = movies[currentIndex]

  if (!activeMovie) {
    return (
      <div className="hero hero--empty" id="hero-section">
        <div className="hero__empty-content">
          <motion.h1
            className="hero__empty-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Welcome to CineAura
          </motion.h1>
          <motion.p
            className="hero__empty-subtitle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Your Cinematic Aura, Decoded.
          </motion.p>
        </div>
        <div className="hero__ambient-orb hero__ambient-orb--1" />
        <div className="hero__ambient-orb hero__ambient-orb--2" />
      </div>
    )
  }

  const {
    _id,
    tmdbId,
    title,
    backdrop,
    backdropOriginal,
    backdropPath,
    shortDescription,
    overview,
    rating,
    voteAverage,
    releaseYear,
    releaseDate,
    runtime,
    genres = [],
  } = activeMovie

  const movieId = _id || tmdbId
  const backdropSrc = getImageUrl(backdrop || backdropOriginal || backdropPath, 'original')
  const year = releaseYear || getYear(releaseDate)
  const ratingVal = rating || voteAverage
  const ratingText = formatRating(ratingVal)
  const duration = formatRuntime(runtime)
  const description = shortDescription || overview || ''
  const parsedGenres = genres.map(g => typeof g === 'object' ? g.name : g).filter(Boolean)
  const genreText = parsedGenres.slice(0, 3).join(' · ')
  const saved = isWatchlisted(movieId)

  const handleWatchlist = async () => {
    if (!isAuthenticated) {
      openAuthModal()
      return
    }
    try {
      const added = await toggleWatchlist(movieId)
      if (added) {
        toast.success('Added to watchlist')
      } else {
        toast.success('Removed from watchlist')
      }
    } catch {
      toast.error('Could not update watchlist')
    }
  }

  const eyebrow = getEyebrowLabel(activeMovie)
  const insights = getInsightReasons(activeMovie)
  const EyebrowIcon = eyebrow.icon

  const metaItems = []
  if (ratingVal > 0) metaItems.push({ key: 'rating', isRating: true, text: ratingText })
  if (year) metaItems.push({ key: 'year', text: year })
  if (duration) metaItems.push({ key: 'duration', text: duration })
  if (genreText) metaItems.push({ key: 'genre', text: genreText })

  const scoreDisplay = ratingVal > 0 ? (typeof ratingVal === 'number' ? ratingVal.toFixed(1) : ratingVal) : null

  return (
    <section className="hero" id="hero-section">

      {/* ── Cinematic backdrop with parallax layers ── */}
      <div className="hero__backdrop">
        <AnimatePresence mode="popLayout">
          {backdropSrc && (
            <motion.img
              key={backdropSrc}
              src={backdropSrc}
              alt={title}
              className="hero__backdrop-img"
              initial={{ opacity: 0, scale: 1.15 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </AnimatePresence>

        {/* Depth layers */}
        <div className="hero__gradient hero__gradient--bottom" />
        <div className="hero__gradient hero__gradient--left" />
        <div className="hero__gradient hero__gradient--vignette" />
        <div className="hero__gradient hero__gradient--top" />
      </div>

      {/* ── Dynamic spotlight glow (recommendation aura) ── */}
      <div className="hero__spotlight" aria-hidden="true" />

      {/* ── Ambient particles ── */}
      <div className="hero__particles" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="hero__particle"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ── Left: Movie info with staggered animations ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={movieId}
          className="hero__content"
          variants={contentVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {/* Dynamic eyebrow */}
          <motion.div className="hero__eyebrow" variants={itemVariants}>
            <span className="hero__eyebrow-dot" />
            <EyebrowIcon size={13} />
            <span>{eyebrow.text}</span>
          </motion.div>

          {/* Title — dominant element */}
          <motion.h1 className="hero__title" variants={titleVariants}>
            {title}
          </motion.h1>

          {/* Metadata */}
          <motion.div className="hero__meta-row" variants={itemVariants}>
            {metaItems.map((item, i) => (
              <span key={item.key}>
                <span className={`hero__meta-item${item.isRating ? ' hero__meta-item--rating' : ''}`}>
                  {item.isRating && <Star size={12} fill="currentColor" />}
                  {item.text}
                </span>
                {i < metaItems.length - 1 && <span className="hero__meta-separator" />}
              </span>
            ))}
          </motion.div>

          {/* Description */}
          {description && (
            <motion.p className="hero__description" variants={itemVariants}>
              {description.length > 180 ? description.slice(0, 180).trimEnd() + '…' : description}
            </motion.p>
          )}

          {/* Actions */}
          <motion.div className="hero__actions" variants={itemVariants}>
            <Link to={`/movies/${movieId}`} className="hero__btn hero__btn--primary">
              <Info size={17} />
              <span>More Info</span>
            </Link>
            <button
              className={`hero__btn hero__btn--secondary ${saved ? 'hero__btn--saved' : ''}`}
              onClick={handleWatchlist}
            >
              {saved ? (
                <>
                  <Check size={17} />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Plus size={17} />
                  <span>Watchlist</span>
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ── Right: Recommendation insight card ── */}
      {insights.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.aside
            key={`insight-${movieId}`}
            className="hero__insight-card"
            initial={{ opacity: 0, y: 30, x: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero__insight-glow" aria-hidden="true" />

            {/* Score circle */}
            {scoreDisplay && (
              <div className="hero__insight-score">
                <div className="hero__insight-score-ring">
                  <svg className="hero__insight-score-svg" viewBox="0 0 64 64">
                    <circle className="hero__insight-score-track" cx="32" cy="32" r="28" />
                    <circle
                      className="hero__insight-score-fill"
                      cx="32" cy="32" r="28"
                      strokeDasharray={`${(scoreDisplay / 10) * 175.93} 175.93`}
                    />
                  </svg>
                  <span className="hero__insight-score-value">{scoreDisplay}</span>
                </div>
                <span className="hero__insight-score-label">TMDB Score</span>
              </div>
            )}

            <div className="hero__insight-divider" />

            {/* Reasons */}
            <div className="hero__insight-reasons">
              <span className="hero__insight-heading">
                <Sparkles size={10} />
                Why CineAura picked this
              </span>
              {insights.map((reason, idx) => {
                const ReasonIcon = reason.icon
                return (
                  <motion.div
                    key={reason.text}
                    className="hero__insight-reason"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + idx * 0.12, duration: 0.5 }}
                  >
                    <ReasonIcon size={13} />
                    <span>{reason.text}</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.aside>
        </AnimatePresence>
      )}

      {/* ── Pagination with progress ── */}
      {movies.length > 1 && (
        <div className="hero__pagination">
          <div className="hero__dots">
            {movies.map((_, i) => (
              <button
                key={i}
                className={`hero__dot${i === currentIndex ? ' hero__dot--active' : ''}`}
                onClick={() => goToSlide(i)}
                aria-label={`Go to hero movie ${i + 1}`}
              >
                {i === currentIndex && (
                  <span
                    className="hero__dot-progress"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom edge fade ── */}
      <div className="hero__bottom-edge" aria-hidden="true" />
    </section>
  )
}

export default HeroSection
