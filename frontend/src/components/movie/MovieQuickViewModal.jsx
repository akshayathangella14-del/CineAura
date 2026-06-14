import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Clock, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useWatchlistStore from '../../store/watchlistStore'
import useUiStore from '../../store/uiStore'
import movieService from '../../services/movieService'
import { getAuraInsight, getRecommendationReason } from '../../utils/movieHoverUtils'
import { formatRating, formatRuntime, getImageUrl } from '../../utils/formatters'
import './MovieQuickViewModal.css'

const MovieQuickViewModal = ({
  movieId,
  isOpen,
  onClose,
  initialMovie = null,
  recommendationReason = null,
  onWatchTrailer,
}) => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const openAuthModal = useUiStore((s) => s.openAuthModal)
  const fetchWatchlistIds = useWatchlistStore((s) => s.fetchWatchlistIds)
  const isWatchlisted = useWatchlistStore((s) => s.isWatchlisted)
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist)

  const [movie, setMovie] = useState(initialMovie)
  const [isLoading, setIsLoading] = useState(false)
  const [watchlistBusy, setWatchlistBusy] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [trailerLoading, setTrailerLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !movieId) return undefined

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, movieId, onClose])

  useEffect(() => {
    if (!isOpen || !movieId) return

    const load = async () => {
      setIsLoading(true)
      try {
        const res = await movieService.getMoviePreview(movieId)
        setMovie({ ...(initialMovie || {}), ...(res.data?.payload || {}) })
      } catch {
        if (initialMovie) setMovie(initialMovie)
        else toast.error('Could not load movie preview')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [isOpen, movieId, initialMovie])

  useEffect(() => {
    if (isOpen && isAuthenticated) fetchWatchlistIds()
  }, [isOpen, isAuthenticated, fetchWatchlistIds])

  if (!isOpen) return null

  const saved = isWatchlisted(movieId)
  const posterSrc = getImageUrl(movie?.poster || movie?.posterPath, 'w500')
  const genres = Array.isArray(movie?.genres)
    ? movie.genres.map((g) => (typeof g === 'object' ? g.name : g)).filter(Boolean)
    : []
  const ratingVal = movie?.rating || movie?.voteAverage
  const whyRecommended = getRecommendationReason(initialMovie || movie, recommendationReason)
  const auraInsight = getAuraInsight(initialMovie || movie)

  const handleWatchlist = async () => {
    if (!isAuthenticated) {
      onClose()
      openAuthModal()
      return
    }

    setWatchlistBusy(true)
    try {
      const added = await toggleWatchlist(movieId)
      if (added) {
        setJustSaved(true)
        toast.success('Added to watchlist')
        setTimeout(() => setJustSaved(false), 800)
      } else {
        toast.success('Removed from watchlist')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update watchlist')
    } finally {
      setWatchlistBusy(false)
    }
  }

  const handleTrailer = async () => {
    if (!onWatchTrailer) return

    setTrailerLoading(true)
    try {
      let url = movie?.trailerEmbedUrl || initialMovie?.trailerEmbedUrl
      if (!url) {
        const res = await movieService.getMovieModal(movieId)
        url = res.data?.payload?.trailerEmbedUrl || res.data?.payload?.movie?.trailerEmbedUrl || ''
      }
      onWatchTrailer(url)
    } finally {
      setTrailerLoading(false)
    }
  }

  const handleFullDetails = () => {
    onClose()
    navigate(`/movies/${movieId}`)
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="movie-quick-view"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="movie-quick-view__panel"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={movie?.title ? `Quick look: ${movie.title}` : 'Movie quick look'}
        >
          <div className="movie-quick-view__glow" aria-hidden="true" />

          <button type="button" className="movie-quick-view__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>

          {isLoading && !movie?.title ? (
            <div className="movie-quick-view__loading">Loading cinematic preview…</div>
          ) : (
            <div className="movie-quick-view__layout">
              <div className="movie-quick-view__poster-col">
                {posterSrc ? (
                  <img src={posterSrc} alt={movie?.title} className="movie-quick-view__poster" />
                ) : (
                  <div className="movie-quick-view__poster-fallback">{movie?.title?.charAt(0)}</div>
                )}
              </div>

              <div className="movie-quick-view__body">
                <p className="movie-quick-view__eyebrow">Quick Look</p>
                <h2 className="movie-quick-view__title">{movie?.title}</h2>

                <div className="movie-quick-view__meta">
                  {ratingVal > 0 && (
                    <span className="movie-quick-view__meta-pill movie-quick-view__meta-pill--score">
                      <Star size={14} fill="currentColor" />
                      {formatRating(ratingVal)} TMDB
                    </span>
                  )}
                  {movie?.runtime > 0 && (
                    <span className="movie-quick-view__meta-pill">
                      <Clock size={14} />
                      {formatRuntime(movie.runtime)}
                    </span>
                  )}
                </div>

                {genres.length > 0 && (
                  <div className="movie-quick-view__genres">
                    {genres.map((genre) => (
                      <span key={genre} className="movie-quick-view__genre">{genre}</span>
                    ))}
                  </div>
                )}

                {whyRecommended && (
                  <div className="movie-quick-view__why">
                    <div className="movie-quick-view__why-header">
                      <Sparkles size={15} />
                      <span>Why Recommended</span>
                    </div>
                    <p>{whyRecommended}</p>
                    {auraInsight && auraInsight !== whyRecommended && (
                      <p className="movie-quick-view__why-insight">{auraInsight}</p>
                    )}
                  </div>
                )}

                {movie?.overview && (
                  <p className="movie-quick-view__overview">{movie.overview}</p>
                )}

                <div className="movie-quick-view__actions">
                  <button
                    type="button"
                    className="movie-quick-view__btn movie-quick-view__btn--primary"
                    onClick={handleTrailer}
                    disabled={trailerLoading}
                  >
                    {trailerLoading ? 'Loading…' : 'Watch Trailer'}
                  </button>
                  <button
                    type="button"
                    className={`movie-quick-view__btn movie-quick-view__btn--save ${saved ? 'movie-quick-view__btn--saved' : ''} ${justSaved ? 'movie-quick-view__btn--pulse' : ''}`}
                    onClick={handleWatchlist}
                    disabled={watchlistBusy}
                  >
                    {saved ? '✓ In Watchlist' : '+ Watchlist'}
                  </button>
                  <button type="button" className="movie-quick-view__btn movie-quick-view__btn--ghost" onClick={handleFullDetails}>
                    Open Full Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

export default MovieQuickViewModal
