import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Star, Clock, Calendar, Plus, Play, Check, Share2, PenLine,
} from 'lucide-react'
import { getReactionEmoji } from '../../utils/movieReactions'
import './MovieDetailsHero.css'

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.12 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
}

const MovieDetailsHero = memo(({
  title,
  backdropSrc,
  posterSrc,
  year,
  runtime,
  runtimeLabel,
  language,
  languageLabel,
  genres,
  overview,
  tmdbRating,
  totalReviews,
  totalReactions,
  watchlistSaved,
  isWatchlistLoading,
  selectedReaction,
  onWatchlist,
  onWriteReview,
  onTrailer,
  onShare,
}) => (
  <section className="md-hero md-hero--cinematic" aria-label={`${title} details`}>
    {backdropSrc && (
      <img src={backdropSrc} alt="" className="md-hero__backdrop md-hero__backdrop--blur" />
    )}
    <div className="md-hero__glow" aria-hidden="true" />
    <div className="md-hero__overlay md-hero__overlay--depth" />

    <motion.div
      className="md-hero__content"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.nav className="md-hero__breadcrumb" aria-label="Breadcrumb" variants={fadeUp}>
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/search">Movies</Link>
        <span>/</span>
        <span>{title}</span>
      </motion.nav>

      <div className="md-hero__grid">
        <motion.aside className="md-hero__left" variants={fadeUp}>
          <div className="md-hero__poster-wrap">
            {posterSrc ? (
              <img src={posterSrc} alt={title} className="md-hero__poster" />
            ) : (
              <div className="md-hero__poster-fallback">{title?.charAt(0) || '?'}</div>
            )}
          </div>

          {selectedReaction && (
            <div className="md-hero__user-reaction md-hero__user-reaction--active">
              <span className="md-hero__user-reaction-emoji" aria-hidden="true">
                {getReactionEmoji(selectedReaction)}
              </span>
              <div>
                <span className="md-hero__user-reaction-label">Your Reaction</span>
                <strong>{selectedReaction}</strong>
              </div>
            </div>
          )}
        </motion.aside>

        <motion.div className="md-hero__center" variants={fadeUp}>
          <h1 className="md-hero__title">{title}</h1>

          <div className="md-hero__meta">
            {year && <span><Calendar size={14} /> {year}</span>}
            {runtime > 0 && <span><Clock size={14} /> {runtimeLabel}</span>}
            {language && <span>{languageLabel}</span>}
          </div>

          {genres.length > 0 && (
            <div className="md-hero__genres">
              {genres.map((genre) => (
                <span key={genre} className="md-hero__genre">{genre}</span>
              ))}
            </div>
          )}

          {overview && <p className="md-hero__overview">{overview}</p>}

          <div className="md-hero__actions">
            <button type="button" className="md-hero__btn md-hero__btn--accent" onClick={onWriteReview}>
              <PenLine size={18} /> Write Review
            </button>
            <button
              type="button"
              className={`md-hero__btn ${watchlistSaved ? 'md-hero__btn--saved' : ''}`}
              onClick={onWatchlist}
              disabled={isWatchlistLoading}
            >
              {isWatchlistLoading ? (
                <span className="movie-details__btn-spinner" />
              ) : watchlistSaved ? (
                <><Check size={18} /> In Watchlist</>
              ) : (
                <><Plus size={18} /> Watchlist</>
              )}
            </button>
            <button type="button" className="md-hero__btn" onClick={onTrailer}>
              <Play size={18} /> Trailer
            </button>
            <button type="button" className="md-hero__btn" onClick={onShare}>
              <Share2 size={18} /> Share
            </button>
          </div>
        </motion.div>

        <motion.aside className="md-hero__right" variants={fadeUp}>
          <div className="md-hero__ratings-card">
            <h2 className="md-hero__ratings-title">Scores</h2>

            {tmdbRating > 0 && (
              <div className="md-hero__ratings-row">
                <Star size={18} fill="var(--warning)" color="var(--warning)" />
                <div className="md-hero__ratings-copy">
                  <strong>{Number(tmdbRating).toFixed(1)}</strong>
                  <span>TMDB Score</span>
                </div>
              </div>
            )}

            {totalReviews > 0 && (
              <div className="md-hero__ratings-row md-hero__ratings-row--stat">
                <div className="md-hero__ratings-copy">
                  <strong>{totalReviews}</strong>
                  <span>Community Reviews</span>
                </div>
              </div>
            )}

            {totalReactions > 0 && (
              <div className="md-hero__ratings-row md-hero__ratings-row--stat">
                <div className="md-hero__ratings-copy">
                  <strong>{totalReactions}</strong>
                  <span>Community Reactions</span>
                </div>
              </div>
            )}
          </div>
        </motion.aside>
      </div>
    </motion.div>
  </section>
))

MovieDetailsHero.displayName = 'MovieDetailsHero'

export default MovieDetailsHero
