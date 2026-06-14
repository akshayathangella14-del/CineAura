import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, TrendingUp, Star, Calendar } from 'lucide-react'
import MovieCard from '../components/movie/MovieCard'
import useMovieStore from '../store/movieStore'
import { CINEAURA_SECTION_TITLES } from '../utils/constants'
import './SeeAllPage.css'

const categoryConfig = {
  'trending': {
    title: CINEAURA_SECTION_TITLES.TRENDING,
    subtitle: "Movies catching CineAura's current spark",
    icon: Flame,
    fetchAction: 'fetchTrending',
    stateKey: 'trendingMovies'
  },
  'popular': {
    title: CINEAURA_SECTION_TITLES.POPULAR,
    subtitle: 'Audience energy from across CineAura',
    icon: TrendingUp,
    fetchAction: 'fetchPopular',
    stateKey: 'popularMovies'
  },
  'top-rated': {
    title: CINEAURA_SECTION_TITLES.TOP_RATED,
    subtitle: 'High-signal picks with lasting pull',
    icon: Star,
    fetchAction: 'fetchTopRated',
    stateKey: 'topRatedMovies'
  },
  'upcoming': {
    title: 'Coming Soon',
    subtitle: 'Upcoming releases to watch for',
    icon: Calendar,
    fetchAction: 'fetchUpcoming',
    stateKey: 'upcomingMovies'
  }
}

const SeeAllPage = ({ category }) => {
  const config = categoryConfig[category]
  
  const fetchAction = useMovieStore((s) => s[config.fetchAction])
  const movies = useMovieStore((s) => s[config.stateKey])
  const storeLoading = useMovieStore((s) => s.isLoading)
  const storeError = useMovieStore((s) => s.error)

  const [isInitialMount, setIsInitialMount] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    setIsInitialMount(false)
    fetchAction()
  }, [category, fetchAction])

  const isLoading = isInitialMount || storeLoading
  const error = isInitialMount ? null : storeError

  const Icon = config.icon

  return (
    <div className="see-all-page" id={`page-see-all-${category}`}>
      <motion.div 
        className="see-all-page__header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="see-all-page__title-wrap">
          <div className="see-all-page__icon">
            <Icon size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="see-all-page__title">{config.title}</h1>
            <p className="see-all-page__subtitle">{config.subtitle}</p>
          </div>
        </div>
      </motion.div>

      {error ? (
        <div className="see-all-page__error">
          <p>{error}</p>
          <button onClick={() => fetchAction()} className="see-all-page__retry-btn">
            Retry
          </button>
        </div>
      ) : (
        <div className="see-all-page__grid">
          {isLoading && movies.length === 0 ? (
            // Skeletons
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="see-all-page__skeleton" />
            ))
          ) : (
            movies.map((movie, index) => (
              <MovieCard key={movie._id || movie.tmdbId} movie={movie} index={index} />
            ))
          )}
          
          {!isLoading && movies.length === 0 && (
            <div className="see-all-page__empty">
              <p>No movies found in this category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SeeAllPage
