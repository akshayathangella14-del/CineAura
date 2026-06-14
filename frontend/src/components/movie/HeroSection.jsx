// CineAura Hero Section — Premium AI-Powered Cinematic Recommendation Showcase
// Architecture preserved: same stores, same props, same data flow
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Star, Info, TrendingUp, Award, Sparkles, Clock, Users, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useUiStore from '../../store/uiStore'
import useWatchlistStore from '../../store/watchlistStore'
import { formatRating, getImageUrl, getYear, formatRuntime } from '../../utils/formatters'
import LoadingSkeleton from '../common/LoadingSkeleton'
import './HeroSection.css'

const ROTATION_INTERVAL = 12000
const EYEBROW_CYCLE_INTERVAL = 5000
const FACT_CYCLE_INTERVAL = 4000

// ── All possible recommendation labels for cycling ──
function getAllEyebrowLabels(movie) {
  const labels = []
  const score = movie.voteAverage || movie.rating || 0
  const popularity = movie.popularity || 0
  const voteCount = movie.voteCount || 0
  const now = new Date()
  const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : null
  const daysSinceRelease = releaseDate
    ? Math.floor((now - releaseDate) / (1000 * 60 * 60 * 24))
    : null

  if (daysSinceRelease !== null && daysSinceRelease >= 0 && daysSinceRelease <= 90) {
    labels.push({ text: 'New Release Spotlight', icon: Clock })
  }
  if (popularity > 80) {
    labels.push({ text: 'Trending Now', icon: TrendingUp })
  }
  if (score >= 7.5) {
    labels.push({ text: 'Critically Acclaimed', icon: Award })
  }
  if (score >= 7.0 && voteCount > 500) {
    labels.push({ text: 'Audience Favorite', icon: Users })
  }
  labels.push({ text: 'CineAura Pick', icon: Sparkles })
  if (popularity > 50) {
    labels.push({ text: 'AI Favorite', icon: Zap })
  }

  return labels.length > 0 ? labels : [{ text: "Editor's Choice", icon: Sparkles }]
}

// ── Generate dynamic facts for cycling ──
function getDynamicFacts(movie) {
  const facts = []
  const score = movie.voteAverage || movie.rating || 0
  const popularity = movie.popularity || 0
  const voteCount = movie.voteCount || 0
  const genres = (movie.genres || []).map(g => typeof g === 'object' ? g.name : g).filter(Boolean)

  if (score > 0) facts.push({ label: 'Audience Score', value: `${score.toFixed(1)}/10`, icon: Star })
  if (popularity > 0) facts.push({ label: 'Popularity', value: popularity > 100 ? 'Very High' : popularity > 50 ? 'High' : 'Rising', icon: TrendingUp })
  if (genres.length > 0) facts.push({ label: 'Genre', value: genres[0], icon: Sparkles })
  if (voteCount > 0) facts.push({ label: 'Ratings', value: voteCount > 1000 ? `${(voteCount / 1000).toFixed(1)}k` : `${voteCount}`, icon: Users })

  return facts.length > 0 ? facts : [{ label: 'Status', value: 'Featured', icon: Sparkles }]
}

// ── Deterministic AI confidence from real movie data ──
function getAIConfidence(movie) {
  const score = movie.voteAverage || movie.rating || 0
  const popularity = movie.popularity || 0
  const voteCount = movie.voteCount || 0

  // Deterministic formula: weighted combination clamped to 82-98
  const base = (score / 10) * 50
  const popBonus = Math.min(popularity / 200, 1) * 25
  const voteBonus = Math.min(voteCount / 5000, 1) * 20
  const raw = base + popBonus + voteBonus + 5
  return Math.min(98, Math.max(82, Math.round(raw)))
}

// ── Generate 2-3 data-driven insight reasons ──
function getInsightReasons(movie) {
  const reasons = []
  const score = movie.voteAverage || movie.rating || 0
  const popularity = movie.popularity || 0
  const voteCount = movie.voteCount || 0
  const genres = (movie.genres || []).map(g => typeof g === 'object' ? g.name : g).filter(Boolean)

  if (popularity > 80) reasons.push({ icon: TrendingUp, text: 'Trending this week' })
  if (score >= 7.0) reasons.push({ icon: Star, text: `${score.toFixed(1)} audience score` })
  if (genres.length > 0 && popularity > 40) reasons.push({ icon: Sparkles, text: `Popular in ${genres[0]}` })

  const now = new Date()
  const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : null
  const daysSinceRelease = releaseDate ? Math.floor((now - releaseDate) / (1000 * 60 * 60 * 24)) : null
  if (daysSinceRelease !== null && daysSinceRelease >= 0 && daysSinceRelease <= 180) reasons.push({ icon: Clock, text: 'Recently released' })
  if (voteCount > 1000) reasons.push({ icon: Users, text: `${(voteCount / 1000).toFixed(1)}k ratings` })

  return reasons.slice(0, 3)
}

// ── Framer Motion variants ──
const contentVariants = {
  enter: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
}

const itemVariants = {
  initial: { opacity: 0, y: 28, filter: 'blur(6px)' },
  enter: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -18, filter: 'blur(4px)', transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const titleVariants = {
  initial: { opacity: 0, y: 35, filter: 'blur(10px)', scale: 0.97 },
  enter: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -20, filter: 'blur(5px)', scale: 0.98, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

// ── Ambient particles ──
const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: 1.5 + Math.random() * 2.5,
  x: 5 + Math.random() * 90,
  y: 5 + Math.random() * 90,
  duration: 20 + Math.random() * 16,
  delay: Math.random() * 10,
  drift: -30 + Math.random() * 60,
}))

const HeroSection = ({ movie, isLoading = false }) => {
  const movies = Array.isArray(movie) ? movie : [movie].filter(Boolean)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [eyebrowIndex, setEyebrowIndex] = useState(0)
  const [factIndex, setFactIndex] = useState(0)
  const progressRef = useRef(null)
  const intervalRef = useRef(null)

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const openAuthModal = useUiStore((s) => s.openAuthModal)
  const isWatchlisted = useWatchlistStore((s) => s.isWatchlisted)
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist)

  // ── Movie rotation + progress ──
  useEffect(() => {
    if (movies.length <= 1) return
    const startTime = Date.now()
    progressRef.current = requestAnimationFrame(function tick() {
      const pct = Math.min(((Date.now() - startTime) / ROTATION_INTERVAL) * 100, 100)
      setProgress(pct)
      if (pct < 100) progressRef.current = requestAnimationFrame(tick)
    })
    intervalRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length)
      setProgress(0)
    }, ROTATION_INTERVAL)
    return () => { cancelAnimationFrame(progressRef.current); clearTimeout(intervalRef.current) }
  }, [currentIndex, movies.length])

  // ── Eyebrow label cycling (keeps Hero alive even with 1 movie) ──
  const activeMovie = movies[currentIndex]
  const eyebrowLabels = useMemo(() => activeMovie ? getAllEyebrowLabels(activeMovie) : [], [activeMovie])

  useEffect(() => {
    if (eyebrowLabels.length <= 1) return
    const id = setInterval(() => setEyebrowIndex(prev => (prev + 1) % eyebrowLabels.length), EYEBROW_CYCLE_INTERVAL)
    return () => clearInterval(id)
  }, [eyebrowLabels.length])

  useEffect(() => { setEyebrowIndex(0) }, [currentIndex])

  // ── Dynamic fact cycling ──
  const dynamicFacts = useMemo(() => activeMovie ? getDynamicFacts(activeMovie) : [], [activeMovie])

  useEffect(() => {
    if (dynamicFacts.length <= 1) return
    const id = setInterval(() => setFactIndex(prev => (prev + 1) % dynamicFacts.length), FACT_CYCLE_INTERVAL)
    return () => clearInterval(id)
  }, [dynamicFacts.length])

  useEffect(() => { setFactIndex(0) }, [currentIndex])

  const goToSlide = useCallback((index) => {
    setProgress(0)
    setCurrentIndex(index)
  }, [])

  if (isLoading) return <LoadingSkeleton variant="hero" />

  if (!activeMovie) {
    return (
      <div className="hero hero--empty" id="hero-section">
        <div className="hero__empty-content">
          <motion.h1 className="hero__empty-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}>
            Welcome to CineAura
          </motion.h1>
          <motion.p className="hero__empty-subtitle" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}>
            Your Cinematic Aura, Decoded.
          </motion.p>
        </div>
        <div className="hero__ambient-orb hero__ambient-orb--1" />
        <div className="hero__ambient-orb hero__ambient-orb--2" />
      </div>
    )
  }

  const {
    _id, tmdbId, title, backdrop, backdropOriginal, backdropPath,
    shortDescription, overview, rating, voteAverage, releaseYear,
    releaseDate, runtime, genres = [],
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
    if (!isAuthenticated) { openAuthModal(); return }
    try {
      const added = await toggleWatchlist(movieId)
      toast.success(added ? 'Added to watchlist' : 'Removed from watchlist')
    } catch { toast.error('Could not update watchlist') }
  }

  const insights = getInsightReasons(activeMovie)
  const scoreDisplay = ratingVal > 0 ? (typeof ratingVal === 'number' ? ratingVal.toFixed(1) : ratingVal) : null
  const confidence = getAIConfidence(activeMovie)
  const currentEyebrow = eyebrowLabels[eyebrowIndex % eyebrowLabels.length] || eyebrowLabels[0]
  const CurrentEyebrowIcon = currentEyebrow?.icon || Sparkles
  const currentFact = dynamicFacts[factIndex % dynamicFacts.length]
  const CurrentFactIcon = currentFact?.icon || Sparkles

  const metaItems = []
  if (ratingVal > 0) metaItems.push({ key: 'rating', isRating: true, text: ratingText })
  if (year) metaItems.push({ key: 'year', text: year })
  if (duration) metaItems.push({ key: 'duration', text: duration })
  if (genreText) metaItems.push({ key: 'genre', text: genreText })

  return (
    <section className="hero" id="hero-section">

      {/* ── LAYER 0: Cinematic backdrop ── */}
      <div className="hero__backdrop">
        <AnimatePresence mode="popLayout">
          {backdropSrc && (
            <motion.img
              key={backdropSrc}
              src={backdropSrc}
              alt={title}
              className="hero__backdrop-img"
              initial={{ opacity: 0, scale: 1.12 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── LAYER 1: Depth gradients ── */}
      <div className="hero__depth-system" aria-hidden="true">
        <div className="hero__gradient hero__gradient--bottom" />
        <div className="hero__gradient hero__gradient--left" />
        <div className="hero__gradient hero__gradient--vignette" />
        <div className="hero__gradient hero__gradient--top" />
        <div className="hero__gradient hero__gradient--atmosphere" />
      </div>

      {/* ── LAYER 2: AI Recommendation Pulse ── */}
      <div className="hero__ai-pulse" aria-hidden="true">
        <div className="hero__spotlight hero__spotlight--primary" />
        <div className="hero__spotlight hero__spotlight--secondary" />
      </div>

      {/* ── LAYER 3: Ambient particles ── */}
      <div className="hero__particles" aria-hidden="true">
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="hero__particle"
            style={{
              width: p.size, height: p.size,
              left: `${p.x}%`, top: `${p.y}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              '--drift': `${p.drift}px`,
            }}
          />
        ))}
      </div>

      {/* ── LAYER 4: Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={movieId}
          className="hero__content"
          variants={contentVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {/* Rotating recommendation eyebrow */}
          <motion.div className="hero__eyebrow-wrapper" variants={itemVariants}>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentEyebrow.text}
                className="hero__eyebrow"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <span className="hero__eyebrow-dot" />
                <CurrentEyebrowIcon size={12} />
                <span>{currentEyebrow.text}</span>
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Title */}
          <motion.h1 className="hero__title" variants={titleVariants}>
            {title}
          </motion.h1>

          {/* AI Confidence + Meta Row */}
          <motion.div className="hero__meta-area" variants={itemVariants}>
            <span className="hero__confidence">
              <Zap size={11} />
              <span className="hero__confidence-value">{confidence}%</span>
              <span className="hero__confidence-label">Match</span>
            </span>
            <span className="hero__meta-divider" />
            {metaItems.map((item, i) => (
              <span key={item.key}>
                <span className={`hero__meta-item${item.isRating ? ' hero__meta-item--rating' : ''}`}>
                  {item.isRating && <Star size={11} fill="currentColor" />}
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

          {/* Rotating dynamic fact */}
          <motion.div className="hero__dynamic-fact-wrapper" variants={itemVariants}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentFact.label}-${factIndex}`}
                className="hero__dynamic-fact"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <CurrentFactIcon size={13} />
                <span className="hero__dynamic-fact-label">{currentFact.label}</span>
                <span className="hero__dynamic-fact-value">{currentFact.value}</span>
              </motion.div>
            </AnimatePresence>
          </motion.div>

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
              {saved ? <><Check size={17} /><span>In Watchlist</span></> : <><Plus size={17} /><span>Watchlist</span></>}
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ── LAYER 5: Insight card ── */}
      {insights.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.aside
            key={`insight-${movieId}`}
            className="hero__insight-card"
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero__insight-glow" aria-hidden="true" />

            {/* AI Confidence ring */}
            {scoreDisplay && (
              <div className="hero__insight-score">
                <div className="hero__insight-score-ring">
                  <svg className="hero__insight-score-svg" viewBox="0 0 64 64">
                    <circle className="hero__insight-score-track" cx="32" cy="32" r="27" />
                    <circle
                      className="hero__insight-score-fill"
                      cx="32" cy="32" r="27"
                      strokeDasharray={`${(scoreDisplay / 10) * 169.65} 169.65`}
                    />
                  </svg>
                  <span className="hero__insight-score-value">{scoreDisplay}</span>
                </div>
                <span className="hero__insight-score-label">TMDB Score</span>
              </div>
            )}

            <div className="hero__insight-divider" />

            {/* Confidence bar */}
            <div className="hero__insight-confidence">
              <div className="hero__insight-confidence-header">
                <Zap size={10} />
                <span>{confidence}% Match</span>
              </div>
              <div className="hero__insight-confidence-bar">
                <motion.div
                  className="hero__insight-confidence-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>

            <div className="hero__insight-divider" />

            {/* Reasons with sequential reveal */}
            <div className="hero__insight-reasons">
              <span className="hero__insight-heading">
                <Sparkles size={10} />
                Why this pick
              </span>
              {insights.map((reason, idx) => {
                const ReasonIcon = reason.icon
                return (
                  <motion.div
                    key={reason.text}
                    className="hero__insight-reason"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + idx * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <ReasonIcon size={12} />
                    <span>{reason.text}</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.aside>
        </AnimatePresence>
      )}

      {/* ── LAYER 6: Progress pagination ── */}
      {movies.length > 1 && (
        <div className="hero__progress-bar">
          <div className="hero__progress-dots">
            {movies.map((_, i) => (
              <button
                key={i}
                className={`hero__progress-dot${i === currentIndex ? ' hero__progress-dot--active' : ''}`}
                onClick={() => goToSlide(i)}
                aria-label={`Go to hero movie ${i + 1}`}
              >
                {i === currentIndex && (
                  <span className="hero__progress-fill" style={{ width: `${progress}%` }} />
                )}
              </button>
            ))}
          </div>
          <span className="hero__progress-counter">
            {currentIndex + 1} / {movies.length}
          </span>
        </div>
      )}

      {/* Bottom blend */}
      <div className="hero__bottom-edge" aria-hidden="true" />
    </section>
  )
}

export default HeroSection
