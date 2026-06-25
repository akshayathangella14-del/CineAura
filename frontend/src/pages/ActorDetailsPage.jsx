import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Film, 
  Briefcase, 
  X
} from 'lucide-react'
import MovieCard from '../components/movie/MovieCard'
import movieService from '../services/movieService'
import { getPersonImage, formatDate, getImageUrl, getYear, formatRating } from '../utils/formatters'
import './ActorDetailsPage.css'

// Skeleton Loader for Premium Experience
const ActorDetailsSkeleton = () => {
  return (
    <div className="actor-skeleton animate-pulse">
      <div className="actor-skeleton__hero">
        <div className="actor-skeleton__backdrop" />
        <div className="actor-skeleton__hero-content">
          <div className="actor-skeleton__portrait" />
          <div className="actor-skeleton__hero-info">
            <div className="actor-skeleton__line actor-skeleton__line--title" />
            <div className="actor-skeleton__chips">
              <div className="actor-skeleton__chip" />
              <div className="actor-skeleton__chip" />
              <div className="actor-skeleton__chip" />
            </div>
          </div>
        </div>
      </div>
      <div className="actor-skeleton__body">
        <div className="actor-skeleton__layout">
          <div className="actor-skeleton__left">
            <div className="actor-skeleton__section" style={{ height: '180px' }} />
          </div>
          <div className="actor-skeleton__right">
            <div className="actor-skeleton__section" style={{ height: '160px' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

const ActorDetailsPage = () => {
  const { actorId } = useParams()
  const navigate = useNavigate()
  
  const [actor, setActor] = useState(null)
  const [creditsData, setCreditsData] = useState(null) // holds { credits, images }
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const [validatedMovies, setValidatedMovies] = useState([])
  
  // Lightbox State
  const [activePhotoIndex, setActivePhotoIndex] = useState(null)

  // Fetch Actor Details
  const fetchActorData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Reject non-numeric and non-Mongo IDs to protect route
      const isNumeric = !isNaN(actorId)
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(actorId)

      if (!isNumeric && !isMongoId) {
        throw new Error('Invalid actor identifier. Talent profile could not be retrieved.')
      }

      const [actorRes, creditsRes] = await Promise.all([
        movieService.getActor(actorId),
        movieService.getActorCredits(actorId)
      ])
      
      if (actorRes.data?.payload) {
        setActor(actorRes.data.payload)
      } else {
        throw new Error('Actor not found')
      }
      
      if (creditsRes.data?.payload) {
        setCreditsData(creditsRes.data.payload)
      }
    } catch (err) {
      console.error('Failed to fetch actor data:', err)
      setError(err.response?.data?.message || err.message || 'Failed to load actor profile.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchActorData()
  }, [actorId])

  // Key Event listener for Lightbox close/navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activePhotoIndex === null || !creditsData?.images) return
      if (e.key === 'Escape') setActivePhotoIndex(null)
      if (e.key === 'ArrowRight') {
        setActivePhotoIndex((prev) => (prev + 1) % creditsData.images.length)
      }
      if (e.key === 'ArrowLeft') {
        setActivePhotoIndex((prev) => (prev - 1 + creditsData.images.length) % creditsData.images.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePhotoIndex, creditsData])

  // Memoized Calculations from TMDB data
  const {
    allCredits,
    popularMovies
  } = useMemo(() => {
    if (!creditsData?.credits) {
      return {
        allCredits: [],
        popularMovies: []
      }
    }

    const cast = creditsData.credits.cast || []
    const crew = creditsData.credits.crew || []
    
    // De-duplicate credits by ID to build combined database
    const seen = new Set()
    const uniqueCredits = []

    const mapItem = (item, roleType) => ({
      id: item.id,
      title: item.title || item.name,
      character: item.character || (item.job ? `${item.job}` : 'Featured Role'),
      mediaType: item.media_type,
      popularity: item.popularity || 0,
      voteCount: item.vote_count || 0,
      voteAverage: item.vote_average || 0,
      posterPath: item.poster_path,
      releaseDate: item.release_date || item.first_air_date,
      year: getYear(item.release_date || item.first_air_date),
      roleType
    })

    cast.forEach(item => {
      if (!item.id || seen.has(item.id)) return
      seen.add(item.id)
      uniqueCredits.push(mapItem(item, 'cast'))
    })

    crew.forEach(item => {
      if (!item.id || seen.has(item.id)) return
      seen.add(item.id)
      uniqueCredits.push(mapItem(item, 'crew'))
    })

    // Sort popular movies using requested weighted formula:
    // score = (popularity * 0.5) + (voteCount * 0.3) + (voteAverage * 0.2)
    const mediaWithScore = uniqueCredits.map(item => {
      const score = (item.popularity * 0.5) + (item.voteCount * 0.3) + (item.voteAverage * 0.2)
      return { ...item, score }
    })
    
    // Get top 12 candidates — we'll validate and keep up to 6
    const sortedPopular = [...mediaWithScore].sort((a, b) => b.score - a.score).slice(0, 12)

    return {
      allCredits: uniqueCredits,
      popularMovies: sortedPopular
    }
  }, [creditsData])

  // Validate which popular movies actually exist in CineAura
  useEffect(() => {
    if (!popularMovies.length) {
      setValidatedMovies([])
      return
    }

    let cancelled = false

    const validateMovies = async () => {
      const results = await Promise.allSettled(
        popularMovies.map((movie) =>
          movieService.getMoviePreview(movie.id)
            .then(() => movie)
            .catch(() => null)
        )
      )

      if (cancelled) return

      const existing = results
        .filter((r) => r.status === 'fulfilled' && r.value !== null)
        .map((r) => r.value)
        .slice(0, 6)

      setValidatedMovies(existing)
    }

    validateMovies()

    return () => { cancelled = true }
  }, [popularMovies])

  if (isLoading) {
    return <ActorDetailsSkeleton />
  }

  // Premium Error Experience
  if (error || !actor) {
    return (
      <div className="actor-error-page">
        <div className="actor-error-card">
          <AlertCircle className="actor-error-icon" size={64} />
          <h2 className="actor-error-title">Unable to load actor details</h2>
          <p className="actor-error-message">{error || "The requested talent profile doesn't exist or is currently offline."}</p>
          <div className="actor-error-actions">
            <button className="actor-btn actor-btn--primary" onClick={fetchActorData}>
              Retry Loading
            </button>
            <button className="actor-btn actor-btn--secondary" onClick={() => navigate(-1)}>
              Go Back
            </button>
            <Link to="/search" className="actor-btn actor-btn--text">
              Browse Movies
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const {
    name,
    biography,
    birthday,
    placeOfBirth,
    popularity,
    profileImage
  } = actor

  // Determine Department Dynamically
  const department = actor.knownForDepartment || 
                     (allCredits.filter(c => c.roleType === 'crew').length > allCredits.filter(c => c.roleType === 'cast').length 
                       ? 'Directing' 
                       : 'Acting')

  // Backdrops & Portrait URLs
  const portraitUrl = getPersonImage(actor, 'h632')
  const backdropUrl = creditsData?.images && creditsData.images.length > 0
    ? getImageUrl(creditsData.images[0].file_path, 'original')
    : (profileImage ? getImageUrl(profileImage, 'original') : null)

  // Biography truncator (3-4 lines clamp)
  const bioLines = biography ? biography.split('\n\n') : []
  const hasLongBio = biography && biography.length > 300

  // Photo gallery limits: Max 6 images
  const displayedPhotos = creditsData?.images ? creditsData.images.slice(0, 6) : []
  
  return (
    <div className="actor-details-premium">
      
      {/* 1. Cinematic Hero Header */}
      <div className="actor-hero">
        <div className="actor-hero__blur-backdrop" style={{ backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none' }} />
        <div className="actor-hero__overlay" />
        
        <div className="actor-hero__container">
          <button className="actor-hero__back-link" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>

          <div className="actor-hero__content">
            <div className="actor-hero__portrait-wrapper">
              {portraitUrl ? (
                <img src={portraitUrl} alt={name} className="actor-hero__portrait" />
              ) : (
                <div className="actor-hero__portrait-fallback">
                  <User size={80} opacity={0.3} />
                </div>
              )}
            </div>

            <div className="actor-hero__main-info">
              <span className="actor-hero__department-badge">
                <Briefcase size={12} style={{ marginRight: '6px' }} /> {department}
              </span>
              <h1 className="actor-hero__name">{name}</h1>

              {/* Premium Stat Chips */}
              <div className="actor-hero__stats">
                {birthday && (
                  <div className="actor-hero__stat-chip">
                    <span className="actor-hero__stat-label">Age</span>
                    <span className="actor-hero__stat-val">
                      {`${new Date().getFullYear() - new Date(birthday).getFullYear()} Years Old`}
                    </span>
                  </div>
                )}
                {placeOfBirth && (
                  <div className="actor-hero__stat-chip">
                    <span className="actor-hero__stat-label">Nationality</span>
                    <span className="actor-hero__stat-val">
                      {placeOfBirth.split(',').pop().trim()}
                    </span>
                  </div>
                )}
                {popularity && (
                  <div className="actor-hero__stat-chip">
                    <span className="actor-hero__stat-label">TMDB Popularity</span>
                    <span className="actor-hero__stat-val">
                      <Star size={14} fill="currentColor" style={{ color: '#fbbf24' }} /> {Math.round(popularity)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="actor-body__container">
        
        {/* 2. About + Biography Section */}
        <div className="actor-grid">
          
          {/* LEFT: Personal Information */}
          <div className="actor-grid__left">
            <div className="actor-card actor-card--meta">
              <h3 className="actor-section-title">Personal Information</h3>
              <div className="actor-meta-grid">
                {birthday && (
                  <div className="actor-meta-item">
                    <Calendar size={16} />
                    <div>
                      <span className="actor-meta-label">Birth Date</span>
                      <span className="actor-meta-val">{formatDate(birthday)}</span>
                    </div>
                  </div>
                )}
                {placeOfBirth && (
                  <div className="actor-meta-item">
                    <MapPin size={16} />
                    <div>
                      <span className="actor-meta-label">Birth Place</span>
                      <span className="actor-meta-val">{placeOfBirth}</span>
                    </div>
                  </div>
                )}
                <div className="actor-meta-item">
                  <Briefcase size={16} />
                  <div>
                    <span className="actor-meta-label">Known For</span>
                    <span className="actor-meta-val">{department}</span>
                  </div>
                </div>
                <div className="actor-meta-item">
                  <Film size={16} />
                  <div>
                    <span className="actor-meta-label">Department</span>
                    <span className="actor-meta-val">{department}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Biography */}
          <div className="actor-grid__right">
            <div className="actor-details-block">
              <h2 className="actor-main-title">Biography</h2>
              {biography ? (
                <div className={`actor-biography ${isBioExpanded ? 'actor-biography--expanded' : ''}`}>
                  <div className="actor-biography__content">
                    {bioLines.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                  {hasLongBio && (
                    <button 
                      className="actor-biography__toggle-btn"
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                    >
                      {isBioExpanded ? (
                        <>Read Less <ChevronUp size={16} /></>
                      ) : (
                        <>Read More <ChevronDown size={16} /></>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="actor-biography--empty">
                  <User size={36} opacity={0.2} />
                  <p>A biography is currently unavailable for {name}.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Popular Movies Shelf (up to 6 validated) */}
        {validatedMovies.length > 0 && (
          <div className="actor-details-block actor-details-block--movies">
            <h2 className="actor-main-title">Popular Movies</h2>
            <div className="actor-popular-grid">
              {validatedMovies.map((movie, index) => (
                <MovieCard
                  key={movie.id}
                  movie={{
                    tmdbId: movie.id,
                    title: movie.title,
                    posterPath: movie.posterPath,
                    releaseYear: movie.year,
                    voteAverage: movie.voteAverage,
                    genres: [],
                  }}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

        {/* 4. Portrait Gallery (Max 6 Desktop / 4 Mobile) */}
        {displayedPhotos.length > 0 && (
          <div className="actor-details-block">
            <div className="actor-gallery-header">
              <h2 className="actor-main-title">Portraits & Gallery</h2>
              {creditsData.images.length > 6 && (
                <button className="actor-gallery-all-btn" onClick={() => setActivePhotoIndex(0)}>
                  View All Photos ({creditsData.images.length})
                </button>
              )}
            </div>
            <div className="actor-gallery-grid">
              {displayedPhotos.map((imgObj, idx) => (
                <div 
                  key={idx} 
                  className={`actor-gallery-item ${idx >= 4 ? 'actor-gallery-item--desktop-only' : ''}`}
                  onClick={() => setActivePhotoIndex(idx)}
                >
                  <img 
                    src={getImageUrl(imgObj.file_path, 'w500')} 
                    alt={`${name} gallery photo ${idx + 1}`} 
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Lightbox Modal Overlay */}
      <AnimatePresence>
        {activePhotoIndex !== null && creditsData?.images && (
          <motion.div 
            className="actor-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="actor-lightbox__backdrop" onClick={() => setActivePhotoIndex(null)} />
            
            <button className="actor-lightbox__close" onClick={() => setActivePhotoIndex(null)}>
              <X size={28} />
            </button>

            <div className="actor-lightbox__content">
              <motion.img 
                key={activePhotoIndex}
                src={getImageUrl(creditsData.images[activePhotoIndex].file_path, 'original')} 
                alt={`${name} lightbox view`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </div>

            {/* Pagination Controls */}
            {creditsData.images.length > 1 && (
              <div className="actor-lightbox__nav">
                <button 
                  className="actor-lightbox__nav-btn"
                  onClick={() => setActivePhotoIndex((prev) => (prev - 1 + creditsData.images.length) % creditsData.images.length)}
                >
                  &#8592;
                </button>
                <span className="actor-lightbox__nav-count">
                  {activePhotoIndex + 1} / {creditsData.images.length}
                </span>
                <button 
                  className="actor-lightbox__nav-btn"
                  onClick={() => setActivePhotoIndex((prev) => (prev + 1) % creditsData.images.length)}
                >
                  &#8594;
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default ActorDetailsPage
