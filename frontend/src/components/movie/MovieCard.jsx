// CineAura Movie Card 5.0 — Poster-dominant overlay approach
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useWatchlistStore from '../../store/watchlistStore'
import useUiStore from '../../store/uiStore'
import movieService from '../../services/movieService'
import MovieQuickViewModal from './MovieQuickViewModal'
import MovieTrailerModal from './MovieTrailerModal'
import { INTERACTION_TYPES } from '../../utils/constants'
import { isTouchDevice } from '../../utils/movieHoverUtils'
import { formatRating, getImageUrl, getYear } from '../../utils/formatters'
import './MovieCard.css'

const stopEvent = (e) => {
  e.preventDefault()
  e.stopPropagation()
}

const MovieCard = ({ movie, index = 0, isWatchlistPage }) => {
  const [isActive, setIsActive] = useState(false)
  const [mobileRevealed, setMobileRevealed] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [trailerUrl, setTrailerUrl] = useState('')
  const [trailerLoading, setTrailerLoading] = useState(false)
  const [watchlistBusy, setWatchlistBusy] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const hoverTracked = useRef(false)
  const longPressTimer = useRef(null)
  const touchDevice = useRef(isTouchDevice())
  const navigate = useNavigate()

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const openAuthModal = useUiStore((s) => s.openAuthModal)
  const fetchWatchlistIds = useWatchlistStore((s) => s.fetchWatchlistIds)
  const isWatchlisted = useWatchlistStore((s) => s.isWatchlisted)
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist)
  const watchlistLoaded = useWatchlistStore((s) => s.isLoaded)

  const payload = movie?.movie || movie
  const {
    _id,
    tmdbId,
    title,
    poster,
    posterOriginal,
    posterPath,
    releaseYear,
    releaseDate,
    rating,
    voteAverage,
    genres = [],
    trailerEmbedUrl,
    trailerKey,
  } = payload || {}

  const movieId = _id || tmdbId

  useEffect(() => {
    if (isAuthenticated && !watchlistLoaded) {
      fetchWatchlistIds()
    }
  }, [isAuthenticated, watchlistLoaded, fetchWatchlistIds])

  if (!movie) return null

  const year = releaseYear || getYear(releaseDate)
  const posterSrc = getImageUrl(poster || posterOriginal || posterPath, 'w500')
  const ratingVal = rating || voteAverage
  const ratingText = ratingVal > 0 ? formatRating(ratingVal) : null
  const parsedGenres = Array.isArray(genres)
    ? genres.map((g) => (typeof g === 'object' ? g.name : g)).filter(Boolean)
    : []
  const metaParts = [year, ...parsedGenres.slice(0, 2)].filter(Boolean)
  const metaLine = metaParts.join(' · ')
  const saved = isWatchlisted(movieId)

  const trackInteraction = (interactionType) => {
    if (!isAuthenticated || !movieId) return
    movieService.saveInteraction({ movieId, interactionType, source: 'movie-card' }).catch(() => {})
  }

  const openDetails = useCallback(() => {
    trackInteraction(INTERACTION_TYPES.MOVIE_CLICK)
    navigate(`/movies/${movieId}`)
  }, [movieId, navigate])

  const handleMouseEnter = () => {
    if (touchDevice.current) return
    setIsActive(true)
    if (!hoverTracked.current) {
      hoverTracked.current = true
      trackInteraction(INTERACTION_TYPES.MOVIE_HOVER)
    }
  }

  const handleMouseLeave = () => {
    if (touchDevice.current) return
    setIsActive(false)
  }

  const handlePosterClick = (e) => {
    if (touchDevice.current) {
      stopEvent(e)
      if (!mobileRevealed) { setMobileRevealed(true); return }
      openDetails()
      return
    }
    openDetails()
  }

  const handleTitleClick = (e) => {
    stopEvent(e)
    openDetails()
  }

  const handleTouchStart = () => {
    if (!touchDevice.current) return
    longPressTimer.current = window.setTimeout(() => setMobileRevealed(true), 480)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const resolveTrailerUrl = async () => {
    if (trailerEmbedUrl) return trailerEmbedUrl
    if (movie?.trailerEmbedUrl) return movie.trailerEmbedUrl
    try {
      const res = await movieService.getMovieModal(movieId)
      return res.data?.payload?.trailerEmbedUrl || res.data?.payload?.movie?.trailerEmbedUrl || ''
    } catch {
      return ''
    }
  }

  const handleWatchTrailer = async (e) => {
    stopEvent(e)
    if (trailerLoading) return
    setTrailerLoading(true)
    try {
      const url = await resolveTrailerUrl()
      if (url || trailerKey) {
        setTrailerUrl(url)
        setTrailerOpen(true)
      } else {
        toast('Trailer Coming Soon', { icon: '🎬' })
      }
    } finally {
      setTrailerLoading(false)
    }
  }

  const handleSave = async (e) => {
    stopEvent(e)
    if (!isAuthenticated) { openAuthModal(); return }
    setWatchlistBusy(true)
    try {
      const added = await toggleWatchlist(movieId)
      if (added) {
        setJustSaved(true)
        toast.success('Added to watchlist')
        window.setTimeout(() => setJustSaved(false), 800)
      } else {
        toast.success('Removed from watchlist')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update watchlist')
    } finally {
      setWatchlistBusy(false)
    }
  }

  const handleQuickLook = (e) => {
    stopEvent(e)
    setQuickViewOpen(true)
  }

  const closeMobileSheet = (e) => {
    stopEvent(e)
    setMobileRevealed(false)
  }

  // Shared action renderer
  const renderActions = (classPrefix = 'movie-card') => (
    <div className={`${classPrefix}__actions`}>
      <div className={`${classPrefix}__actions-row`}>
        <button
          type="button"
          className={`${classPrefix}__btn ${classPrefix}__btn--primary`}
          onClick={handleWatchTrailer}
          onMouseDown={stopEvent}
          disabled={trailerLoading}
        >
          {trailerLoading ? '…' : '▶ Watch Trailer'}
        </button>
        <button
          type="button"
          className={[
            `${classPrefix}__btn`,
            `${classPrefix}__btn--save`,
            saved ? `${classPrefix}__btn--saved` : '',
            justSaved ? `${classPrefix}__btn--pulse` : '',
          ].filter(Boolean).join(' ')}
          onClick={handleSave}
          onMouseDown={stopEvent}
          disabled={watchlistBusy}
        >
          {isWatchlistPage ? 'Remove' : (saved ? '✓ In Watchlist' : '+ Watchlist')}
        </button>
      </div>
      <button
        type="button"
        className={`${classPrefix}__btn ${classPrefix}__btn--ghost`}
        onClick={handleQuickLook}
        onMouseDown={stopEvent}
      >
        Quick Look
      </button>
    </div>
  )

  return (
    <>
      <motion.div
        className={`movie-card ${isActive ? 'movie-card--active' : ''}`}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.22, delay: index * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Fixed-size slot — reserves space so siblings never shift */}
        <div className="movie-card__slot">
          <div className="movie-card__popout">
            <div className="movie-card__surface">

              {/* Poster — absolute fill */}
              <button
                type="button"
                className="movie-card__poster-hit"
                onClick={handlePosterClick}
                aria-label={`Open ${title}`}
                tabIndex={isActive ? -1 : 0}
              >
                {posterSrc ? (
                  <img src={posterSrc} alt="" className="movie-card__poster" loading="lazy" />
                ) : (
                  <div className="movie-card__poster-fallback">
                    <span>{title?.charAt(0) || '?'}</span>
                  </div>
                )}
              </button>

              {/* Rating badge */}
              {ratingText && (
                <div className="movie-card__score">⭐ {ratingText}</div>
              )}

              {/* Overlay — slides up over poster on hover */}
              <div
                className="movie-card__overlay"
                onMouseDown={stopEvent}
                onClick={stopEvent}
                aria-hidden={!isActive}
              >
                <h4 className="movie-card__panel-title">{title}</h4>
                {metaLine && <p className="movie-card__meta-line">{metaLine}</p>}
                {renderActions()}
              </div>

            </div>
          </div>
        </div>

        {/* Title below — fades when active */}
        <button type="button" className="movie-card__title-btn" onClick={handleTitleClick}>
          <h3 className="movie-card__title">{title}</h3>
        </button>
      </motion.div>

      {/* Mobile action sheet */}
      {touchDevice.current && mobileRevealed && createPortal(
        <div className="movie-card-sheet" role="dialog" aria-modal="true" aria-label={`Actions for ${title}`}>
          <button
            type="button"
            className="movie-card-sheet__backdrop"
            onClick={closeMobileSheet}
            aria-label="Close"
          />
          <div className="movie-card-sheet__panel">
            <div className="movie-card-sheet__header">
              <h4>{title}</h4>
              {metaLine && <p>{metaLine}</p>}
            </div>
            {renderActions('movie-card-sheet')}
            <button
              type="button"
              className="movie-card-sheet__details"
              onClick={(e) => { stopEvent(e); openDetails() }}
            >
              Open Full Details
            </button>
          </div>
        </div>,
        document.body
      )}

      <MovieQuickViewModal
        movieId={movieId}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        initialMovie={movie}
        onWatchTrailer={(url) => {
          if (url) { setTrailerUrl(url); setTrailerOpen(true) }
          else toast('Trailer Coming Soon', { icon: '🎬' })
        }}
      />

      <MovieTrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        title={title}
        trailerEmbedUrl={trailerUrl}
      />
    </>
  )
}

export default MovieCard