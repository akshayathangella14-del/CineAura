// CineAura Hero Section — Recommendation-Focused Cinematic Showcase
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Star, Info, TrendingUp, Award, Sparkles, Clock, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useUiStore from '../../store/uiStore'
import useWatchlistStore from '../../store/watchlistStore'
import { formatRating, getImageUrl, getYear, formatRuntime } from '../../utils/formatters'
import LoadingSkeleton from '../common/LoadingSkeleton'
import './HeroSection.css'

const ROTATION_INTERVAL = 150000

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

  // Return max 3 most relevant
  return reasons.slice(0, 3)
}

const HeroSection = ({ movie, isLoading = false }) => {
  const movies = Array.isArray(movie) ? movie : [movie].filter(Boolean)
  const [currentIndex, setCurrentIndex] = useState(0)

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const openAuthModal = useUiStore((s) => s.openAuthModal)
  const isWatchlisted = useWatchlistStore((s) => s.isWatchlisted)
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist)

  useEffect(() => {
    if (movies.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length)
    }, ROTATION_INTERVAL)
    return () => clearInterval(interval)
  }, [movies.length])

  const goToSlide = useCallback((index) => {
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

  // Build metadata items
  const metaItems = []
  if (ratingVal > 0) metaItems.push({ key: 'rating', isRating: true, text: ratingText })
  if (year) metaItems.push({ key: 'year', text: year })
  if (duration) metaItems.push({ key: 'duration', text: duration })
  if (genreText) metaItems.push({ key: 'genre', text: genreText })

  const scoreDisplay = ratingVal > 0 ? (typeof ratingVal === 'number' ? ratingVal.toFixed(1) : ratingVal) : null

  return (
    <section className="hero" id="hero-section">
      {/* Backdrop with crossfade */}
      <div className="hero__backdrop">
        <AnimatePresence mode="popLayout">
          {backdropSrc && (
            <motion.img
              key={backdropSrc}
              src={backdropSrc}
              alt={title}
              className="hero__backdrop-img hero__backdrop-img--absolute"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          )}
        </AnimatePresence>
        <div className="hero__gradient hero__gradient--bottom" />
        <div className="hero__gradient hero__gradient--left" />
        <div className="hero__gradient hero__gradient--vignette" />
      </div>

      {/* Left: Movie info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={movieId}
          className="hero__content"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Dynamic eyebrow */}
          <span className="hero__eyebrow">
            <EyebrowIcon size={13} />
            {eyebrow.text}
          </span>

          {/* Metadata */}
          <div className="hero__meta-row">
            {metaItems.map((item, i) => (
              <span key={item.key}>
                <span className={`hero__meta-item${item.isRating ? ' hero__meta-item--rating' : ''}`}>
                  {item.isRating && <Star size={12} fill="currentColor" />}
                  {item.text}
                </span>
                {i < metaItems.length - 1 && <span className="hero__meta-separator" />}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="hero__title">{title}</h1>

          {/* Description */}
          {description && (
            <p className="hero__description">
              {description.length > 180 ? description.slice(0, 180).trimEnd() + '…' : description}
            </p>
          )}

          {/* Actions */}
          <div className="hero__actions">
            <Link to={`/movies/${movieId}`} className="hero__btn hero__btn--primary">
              <Info size={17} />
              <span>More Info</span>
            </Link>
            <button
              className={`hero__btn hero__btn--secondary ${saved ? 'hero__btn--saved' : ''}`}
              onClick={handleWatchlist}
            >
              {saved ? '✓ In Watchlist' : (
                <>
                  <Plus size={17} />
                  <span>Watchlist</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Right: Recommendation insight card */}
      {insights.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.aside
            key={`insight-${movieId}`}
            className="hero__insight-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Score circle */}
            {scoreDisplay && (
              <div className="hero__insight-score">
                <div className="hero__insight-score-ring">
                  <span className="hero__insight-score-value">{scoreDisplay}</span>
                </div>
                <span className="hero__insight-score-label">TMDB Score</span>
              </div>
            )}

            {/* Divider */}
            <div className="hero__insight-divider" />

            {/* Reasons */}
            <div className="hero__insight-reasons">
              <span className="hero__insight-heading">Why this pick</span>
              {insights.map((reason) => {
                const ReasonIcon = reason.icon
                return (
                  <div key={reason.text} className="hero__insight-reason">
                    <ReasonIcon size={13} />
                    <span>{reason.text}</span>
                  </div>
                )
              })}
            </div>
          </motion.aside>
        </AnimatePresence>
      )}

      {/* Pagination dots */}
      {movies.length > 1 && (
        <div className="hero__dots">
          {movies.map((_, i) => (
            <button
              key={i}
              className={`hero__dot${i === currentIndex ? ' hero__dot--active' : ''}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to hero movie ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default HeroSection
