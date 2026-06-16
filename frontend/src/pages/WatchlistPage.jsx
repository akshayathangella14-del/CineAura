import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clapperboard, ListChecks, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import movieService from '../services/movieService'
import CineAuraLoader from '../components/common/CineAuraLoader'
import SectionHeader from '../components/common/SectionHeader'
import MovieRow from '../components/movie/MovieRow'
import MovieCard from '../components/movie/MovieCard'
import { getImageUrl } from '../utils/formatters'
import './WatchlistPage.css'

const SORT_OPTIONS = [
  { value: 'recently-added', label: 'Recently Added' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'newest-release', label: 'Newest Release' },
  { value: 'oldest-release', label: 'Oldest Release' },
  { value: 'a-z', label: 'A–Z' },
  { value: 'z-a', label: 'Z–A' }
]

const WatchlistPage = () => {
  const navigate = useNavigate()
  const [sections, setSections] = useState([])
  const [watchlistItems, setWatchlistItems] = useState([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [sortParam, setSortParam] = useState('recently-added')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    movieService.getWatchlist()
      .then(res => {
        setSections(res.data?.sections || [])
        setWatchlistItems(res.data?.payload || [])
        setCount(res.data?.payload?.length || 0)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Section data extraction
  const watchNextSection = sections.find(s => s.key === 'watching-soon')
  const watchNextMovies = watchNextSection ? (watchNextSection.movies || []).slice(0, 6) : []
  const featuredMovie = watchNextMovies.length > 0 ? watchNextMovies[0] : null
  const remainingWatchNext = watchNextMovies.slice(1)
  const featuredPosterSrc = featuredMovie ? getImageUrl(featuredMovie.poster || featuredMovie.posterOriginal || featuredMovie.posterPath || featuredMovie.backdropImage, 'w500') : null

  // UI-level filtering to prevent visual duplication
  const watchNextIds = new Set(watchNextMovies.map(m => String(m._id || m.tmdbId)))
  const myWatchlistMovies = watchlistItems
    .map(item => item.movie)
    .filter(m => m && !watchNextIds.has(String(m._id || m.tmdbId)))

  const sortedMyWatchlist = useMemo(() => {
    const list = [...myWatchlistMovies]
    switch (sortParam) {
      case 'highest-rated':
        return list.sort((a, b) => (b.rating || b.averageRating || 0) - (a.rating || a.averageRating || 0))
      case 'newest-release':
        return list.sort((a, b) => {
          const yearB = b.releaseYear || parseInt(b.releaseDate?.substring(0,4)) || 0;
          const yearA = a.releaseYear || parseInt(a.releaseDate?.substring(0,4)) || 0;
          return yearB - yearA;
        })
      case 'oldest-release':
        return list.sort((a, b) => {
          const yearB = b.releaseYear || parseInt(b.releaseDate?.substring(0,4)) || 0;
          const yearA = a.releaseYear || parseInt(a.releaseDate?.substring(0,4)) || 0;
          return yearA - yearB;
        })
      case 'a-z':
        return list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
      case 'z-a':
        return list.sort((a, b) => (b.title || '').localeCompare(a.title || ''))
      case 'recently-added':
      default:
        return list
    }
  }, [myWatchlistMovies, sortParam])

  if (isLoading) return <CineAuraLoader variant="page" />

  if (count === 0) {
    return (
      <div id="page-watchlist" className="watchlist-page">
        <div className="watchlist-page__premium-empty">
          <Clapperboard size={56} className="watchlist-page__empty-icon" />
          <h1 className="watchlist-page__empty-title">Your Watchlist Is Empty</h1>
          <p className="watchlist-page__empty-subtitle">Start building your personal cinema shelf by adding movies you want to discover later.</p>
          <button type="button" className="watchlist-page__empty-btn" onClick={() => navigate('/')}>
            Discover Movies
          </button>
        </div>
      </div>
    )
  }

  return (
    <div id="page-watchlist" className="watchlist-page">
      <section className="watchlist-page__hero">
        <div className="watchlist-page__hero-title-row">
          <h1>Your Watchlist</h1>
          <span className="watchlist-page__count-badge">{count} Movies In Watchlist</span>
        </div>
        <p>Curated movies waiting for the right night.</p>
      </section>

      {featuredMovie && (
        <section className="watchlist-page__section">
          <div className="watchlist-page__section-header-wrap">
            <SectionHeader title="Featured Recommendation" icon={ListChecks} />
            <p className="watchlist-page__section-subtitle">Recommended because it closely matches your viewing preferences and watchlist activity.</p>
          </div>
          <div className="watchlist-page__featured">
            <div className="watchlist-page__featured-poster-wrap">
              {featuredPosterSrc ? (
                <img 
                  src={featuredPosterSrc} 
                  alt={featuredMovie.title} 
                  className="watchlist-page__featured-poster" 
                />
              ) : (
                <div className="watchlist-page__featured-poster-fallback">
                  {featuredMovie.title.charAt(0)}
                </div>
              )}
            </div>
            <div className="watchlist-page__featured-info">
              <h2 className="watchlist-page__featured-title">{featuredMovie.title}</h2>
              <div className="watchlist-page__featured-meta">
                {(featuredMovie.rating || featuredMovie.averageRating) > 0 && <span className="watchlist-page__featured-rating">★ {(featuredMovie.rating || featuredMovie.averageRating).toFixed(1)}</span>}
                {featuredMovie.releaseYear && <span>{featuredMovie.releaseYear}</span>}
                {featuredMovie.genres && <span>{featuredMovie.genres.slice(0, 3).join(', ')}</span>}
              </div>
              <p className="watchlist-page__featured-overview">{featuredMovie.overview}</p>
              <div className="watchlist-page__featured-actions">
                <button type="button" className="watchlist-page__btn watchlist-page__btn--primary" onClick={() => navigate(`/movies/${featuredMovie._id || featuredMovie.tmdbId}`)}>
                  View Details
                </button>
                {(featuredMovie.trailerUrl || featuredMovie.trailerEmbedUrl) && (
                  <button type="button" className="watchlist-page__btn watchlist-page__btn--ghost" onClick={() => window.open(featuredMovie.trailerUrl || featuredMovie.trailerEmbedUrl, '_blank')}>
                    Watch Trailer
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {remainingWatchNext.length > 0 && (
        <section className="watchlist-page__section">
          <div className="watchlist-page__section-header-wrap">
            <SectionHeader title="More Picks For You" icon={ListChecks} />
            <p className="watchlist-page__section-subtitle">Selected from your watchlist activity.</p>
          </div>
          <MovieRow movies={remainingWatchNext} />
        </section>
      )}

      {myWatchlistMovies.length > 0 && (
        <section className="watchlist-page__section watchlist-page__section--grid">
          <div className="watchlist-page__grid-header">
            <div>
              <SectionHeader title="All Movies" icon={ListChecks} />
              <p className="watchlist-page__section-subtitle">Matches your cinematic taste profile.</p>
            </div>
            <div className="watchlist-page__custom-dropdown" ref={dropdownRef}>
              <button
                type="button"
                className={`watchlist-page__dropdown-btn ${isDropdownOpen ? 'watchlist-page__dropdown-btn--active' : ''}`}
                onClick={() => setIsDropdownOpen(prev => !prev)}
                aria-expanded={isDropdownOpen}
              >
                {SORT_OPTIONS.find(opt => opt.value === sortParam)?.label}
                <ChevronDown size={16} />
              </button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.ul
                    className="watchlist-page__dropdown-menu"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {SORT_OPTIONS.map(opt => (
                      <li key={opt.value}>
                        <button
                          type="button"
                          className={opt.value === sortParam ? 'active' : ''}
                          onClick={() => {
                            setSortParam(opt.value)
                            setIsDropdownOpen(false)
                          }}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="watchlist-page__grid">
            {sortedMyWatchlist.map((movie, idx) => (
              <MovieCard key={movie._id || movie.tmdbId} movie={movie} index={idx} isWatchlistPage={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default WatchlistPage
