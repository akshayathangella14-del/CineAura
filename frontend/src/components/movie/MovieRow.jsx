// CineAura Movie Row
// Horizontally scrollable row of MovieCards with smooth scroll
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MovieCard from './MovieCard'
import LoadingSkeleton from '../common/LoadingSkeleton'
import './MovieRow.css'

const MovieRow = ({ movies = [], isLoading = false, skeletonCount = 6 }) => {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.7
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  if (isLoading) {
    return <LoadingSkeleton variant="card" count={skeletonCount} />
  }

  if (!movies.length) {
    return (
      <div className="movie-row__empty">
        <p>No movies to display yet</p>
      </div>
    )
  }

  return (
    <div className="movie-row">
      {/* Scroll arrows */}
      <button
        className="movie-row__arrow movie-row__arrow--left"
        onClick={() => scroll('left')}
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        className="movie-row__arrow movie-row__arrow--right"
        onClick={() => scroll('right')}
        aria-label="Scroll right"
      >
        <ChevronRight size={20} />
      </button>

      {/* Scrollable track */}
      <motion.div
        className="movie-row__track"
        ref={scrollRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {movies.map((movie, i) => (
          <MovieCard key={movie._id || movie.tmdbId || i} movie={movie} index={i} />
        ))}
      </motion.div>

      {/* Edge fades */}
      <div className="movie-row__fade movie-row__fade--left" />
      <div className="movie-row__fade movie-row__fade--right" />
    </div>
  )
}

export default MovieRow