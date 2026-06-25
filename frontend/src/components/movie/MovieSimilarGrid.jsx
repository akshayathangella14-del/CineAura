import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Check, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useWatchlistStore from '../../store/watchlistStore'
import { getImageUrl, getYear } from '../../utils/formatters'
import './MovieSimilarGrid.css'

const SimilarMovieCard = ({ item, index }) => {
  const movie = item.movie || item
  const id = movie._id || movie.tmdbId
  const poster = getImageUrl(movie.poster || movie.posterOriginal || movie.posterPath, 'w342')
  const year = movie.releaseYear || getYear(movie.releaseDate)
  const rating = movie.rating || movie.voteAverage || movie.averageRating

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isWatchlisted = useWatchlistStore((s) => s.isWatchlisted)
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist)
  const setWatchlisted = useWatchlistStore((s) => s.setWatchlisted)

  const [isSaving, setIsSaving] = useState(false)
  const saved = isWatchlisted(id)
  const navigate = useNavigate()

  const handleWatchlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Please log in to use the watchlist')
      return
    }

    setIsSaving(true)
    try {
      const added = await toggleWatchlist(id)
      setWatchlisted(id, added !== false)
      toast.success(added ? 'Added to watchlist' : 'Removed from watchlist')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update watchlist')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <article
      className="movie-similar-card--premium"
      onClick={() => navigate(`/movies/${id}`)}
    >
      <div className="movie-similar-card__poster-wrap">
        {poster ? (
          <img src={poster} alt={movie.title} className="movie-similar-card__poster" />
        ) : (
          <div className="movie-similar-card__fallback">{movie.title?.charAt(0) || '?'}</div>
        )}

        <div className="movie-similar-card__overlay">
          <button
            type="button"
            className="movie-similar-card__overlay-btn movie-similar-card__overlay-btn--primary"
            onClick={(e) => { e.stopPropagation(); navigate(`/movies/${id}`) }}
          >
            <Info size={13} /> Details
          </button>
          <button
            type="button"
            className={`movie-similar-card__overlay-btn ${saved ? 'saved' : ''}`}
            onClick={handleWatchlist}
            disabled={isSaving}
          >
            {saved ? <Check size={13} /> : <Plus size={13} />}
            {saved ? 'Saved' : 'Watchlist'}
          </button>
        </div>
      </div>

      <div className="movie-similar-card__content">
        <h3 className="movie-similar-card__title">{movie.title}</h3>
        <div className="movie-similar-card__meta">
          {year && <span>{year}</span>}
          {year && rating > 0 && <span className="movie-similar-card__dot">•</span>}
          {rating > 0 && (
            <span className="movie-similar-card__rating">★ {Number(rating).toFixed(1)}</span>
          )}
        </div>
      </div>
    </article>
  )
}

const MovieSimilarGrid = ({ movies = [], isLoading = false, currentMovie }) => {
  const [visibleCount, setVisibleCount] = useState(12)

  if (isLoading) {
    return (
      <section className="movie-similar-grid-section--premium" aria-label="Similar movies loading">
        <div className="movie-similar-grid-section__header">
          <h2 className="movie-similar-grid-section__title">More Like This</h2>
        </div>
        <div className="movie-similar-grid--premium">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="movie-similar-card--skeleton" />
          ))}
        </div>
      </section>
    )
  }

  if (!movies.length) return null

  const visibleMovies = movies.slice(0, visibleCount)
  const hasMore = visibleCount < movies.length
  const titleText = currentMovie?.title ? `More Like ${currentMovie.title}` : 'More Like This'

  return (
    <section className="movie-similar-grid-section--premium" aria-label="Similar movies">
      <div className="movie-similar-grid-section__header">
        <h2 className="movie-similar-grid-section__title">{titleText}</h2>
        <span className="movie-similar-grid-section__subtitle">{movies.length} picks</span>
      </div>

      <div className="movie-similar-grid--premium">
        {visibleMovies.map((item, index) => (
          <SimilarMovieCard
            key={item.movie?._id || item.movie?.tmdbId || item._id || item.tmdbId || index}
            item={item}
            index={index}
          />
        ))}
      </div>

      {hasMore && (
        <button
          className="movie-similar-grid-section__load-more"
          onClick={() => setVisibleCount((prev) => prev + 12)}
        >
          Show more
        </button>
      )}
    </section>
  )
}

export default MovieSimilarGrid