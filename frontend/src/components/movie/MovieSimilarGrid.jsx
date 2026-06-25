import { useState } from 'react'
import MovieCard from './MovieCard'
import './MovieSimilarGrid.css'

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
        {visibleMovies.map((item, index) => {
          const movie = item.movie || item
          return (
            <MovieCard
              key={movie._id || movie.tmdbId || index}
              movie={movie}
              index={index}
            />
          )
        })}
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