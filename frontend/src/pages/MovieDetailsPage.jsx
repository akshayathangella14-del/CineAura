import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import useMovieStore from '../store/movieStore'
import useAuthStore from '../store/authStore'
import useWatchlistStore from '../store/watchlistStore'
import movieService from '../services/movieService'
import recommendationService from '../services/recommendationService'
import { INTERACTION_TYPES } from '../utils/constants'
import { getImageUrl, formatRuntime, getYear, formatLanguage } from '../utils/formatters'
import MovieDetailsHero from '../components/movie/MovieDetailsHero'
import MovieDetailsSkeleton from '../components/movie/MovieDetailsSkeleton'
import TrailerModal from '../components/movie/TrailerModal'
import MovieStreamingSection from '../components/movie/MovieStreamingSection'
import MovieCommunityReactions from '../components/movie/MovieCommunityReactions'
import MovieCastSection from '../components/movie/MovieCastSection'
import MovieReviewsSection from '../components/movie/MovieReviewsSection'
import MovieMetadataPanel from '../components/movie/MovieMetadataPanel'
import MovieSimilarGrid from '../components/movie/MovieSimilarGrid'
import './MovieDetailsPage.css'

const MovieDetailsPage = () => {
  const { movieId } = useParams()
  const [searchParams] = useSearchParams()

  const currentMovie = useMovieStore((s) => s.currentMovie)
  const isLoading = useMovieStore((s) => s.isLoading)
  const error = useMovieStore((s) => s.error)
  const fetchMovieDetails = useMovieStore((s) => s.fetchMovieDetails)
  const clearCurrentMovie = useMovieStore((s) => s.clearCurrentMovie)

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isWatchlisted = useWatchlistStore((s) => s.isWatchlisted)
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist)
  const setWatchlisted = useWatchlistStore((s) => s.setWatchlisted)

  const [similarMovies, setSimilarMovies] = useState([])
  const [isSimilarLoading, setIsSimilarLoading] = useState(true)
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false)
  const [reactionCounts, setReactionCounts] = useState({})
  const [selectedReaction, setSelectedReaction] = useState('')
  const [liveReviewCount, setLiveReviewCount] = useState(0)
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchMovieDetails(movieId)

    const fetchSimilar = async () => {
      setIsSimilarLoading(true)
      try {
        const res = await recommendationService.getSimilarMovies(movieId)
        const payload = res.data?.payload
        if (Array.isArray(payload)) setSimilarMovies(payload)
        else if (Array.isArray(payload?.movies)) setSimilarMovies(payload.movies)
        else setSimilarMovies([])
      } catch {
        setSimilarMovies([])
      } finally {
        setIsSimilarLoading(false)
      }
    }
    fetchSimilar()

    return () => clearCurrentMovie()
  }, [movieId, fetchMovieDetails, clearCurrentMovie])

  useEffect(() => {
    if (!currentMovie) return
    setLiveReviewCount(currentMovie.totalReviews > 0 ? currentMovie.totalReviews : 0)
  }, [currentMovie])

  useEffect(() => {
    if (!isAuthenticated || !currentMovie) return

    movieService.saveInteraction({
      movieId,
      interactionType: INTERACTION_TYPES.MOVIE_OPEN,
      source: 'movie-details',
    }).catch(() => {})
  }, [movieId, isAuthenticated, currentMovie])

  useEffect(() => {
    if (!isAuthenticated) return
    useWatchlistStore.getState().fetchWatchlistIds()
  }, [isAuthenticated])

  useEffect(() => {
    const fetchReactions = async () => {
      if (!currentMovie) return

      const currentMovieId = currentMovie._id || currentMovie.tmdbId || movieId

      try {
        const res = await movieService.getMovieReactions(currentMovieId)
        setReactionCounts(res.data?.payload || {})

        if (isAuthenticated) {
          const userRes = await movieService.getUserReaction(currentMovieId)
          setSelectedReaction(userRes.data?.payload?.reaction || '')
        } else {
          setSelectedReaction('')
        }
      } catch {
        setReactionCounts({})
      }
    }

    fetchReactions()
  }, [currentMovie, movieId, isAuthenticated])

  useEffect(() => {
    if (!currentMovie || searchParams.get('focus') !== 'trailer') return
    setIsTrailerOpen(true)
  }, [currentMovie, searchParams])

  const uniqueProviders = useMemo(() => {
    const providers = currentMovie?.providers
    if (!providers?.length) return []

    const seen = new Set()
    const list = []
    for (const provider of providers) {
      const key = `${provider.providerName}-${provider.type}`
      if (!provider?.providerName || seen.has(key)) continue
      seen.add(key)
      list.push(provider)
    }
    return list
  }, [currentMovie?.providers])

  const totalReactions = useMemo(
    () => Object.values(reactionCounts).reduce((sum, count) => sum + (count || 0), 0),
    [reactionCounts]
  )

  const handleWatchlistClick = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to use the watchlist')
      return
    }

    const id = currentMovie._id || currentMovie.tmdbId
    setIsWatchlistLoading(true)
    try {
      const added = await toggleWatchlist(id)
      setWatchlisted(id, added !== false)
      toast.success(added ? 'Added to watchlist' : 'Removed from watchlist')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update watchlist')
    } finally {
      setIsWatchlistLoading(false)
    }
  }

  const handleReaction = async (reaction) => {
    if (!isAuthenticated) {
      toast.error('Please log in to react to movies')
      return
    }

    try {
      const currentMovieId = currentMovie._id || currentMovie.tmdbId || movieId
      const res = await movieService.saveReaction({ movieId: currentMovieId, reaction })

      const nextReaction = res.data?.payload?.reaction || ''
      setSelectedReaction(nextReaction)
      setReactionCounts(res.data?.reactionCounts || {})
      toast.success(nextReaction ? 'Reaction saved' : 'Reaction removed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save reaction')
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: currentMovie?.title, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard')
      }
    } catch {
      toast.error('Could not share link')
    }
  }

  const scrollToReviews = () => {
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleReviewChange = useCallback((count) => {
    if (typeof count === 'number') {
      setLiveReviewCount(count > 0 ? count : 0)
    }
    fetchMovieDetails(movieId)
  }, [movieId, fetchMovieDetails])

  if (isLoading) {
    return <MovieDetailsSkeleton />
  }

if (error) {
  return (
    <div className="movie-details__error">
      <AlertCircle size={48} />
      <p>{error}</p>
      <button
        type="button"
        onClick={() => fetchMovieDetails(movieId)}
      >
        Retry
      </button>
    </div>
  )
}

if (!currentMovie) {
  return <MovieDetailsSkeleton />
}

  const {
    title,
    overview,
    genres = [],
    releaseDate,
    releaseYear,
    runtime,
    rating,
    voteAverage,
    poster,
    posterPath,
    posterOriginal,
    backdrop,
    backdropPath,
    backdropOriginal,
    cast = [],
    directors = [],
    writers = [],
    crew = [],
    language,
    spokenLanguages = [],
    subtitleLanguages = [],
    productionCountries = [],
    status,
    keywords = [],
    trailerEmbedUrl,
  } = currentMovie

  const backdropSrc = getImageUrl(backdrop || backdropOriginal || backdropPath, 'original')
  const posterSrc = getImageUrl(poster || posterOriginal || posterPath, 'original')
  const year = releaseYear || getYear(releaseDate)
  const tmdbRating = rating || voteAverage
  const currentMovieId = currentMovie._id || currentMovie.tmdbId || movieId
  const watchlistSaved = isWatchlisted(currentMovieId)

  const parsedGenres = Array.isArray(genres)
    ? genres.map((g) => (typeof g === 'object' ? g.name : g)).filter(Boolean)
    : []

  const reviewCount = liveReviewCount > 0 ? liveReviewCount : 0
  const reactionTotal = totalReactions > 0 ? totalReactions : 0

  return (
    <div className="movie-details-page" id="page-movie-details">
      <MovieDetailsHero
        title={title}
        backdropSrc={backdropSrc}
        posterSrc={posterSrc}
        year={year}
        runtime={runtime}
        runtimeLabel={formatRuntime(runtime)}
        language={language}
        languageLabel={formatLanguage(language)}
        genres={parsedGenres}
        overview={overview}
        tmdbRating={tmdbRating}
        totalReviews={reviewCount}
        totalReactions={reactionTotal}
        watchlistSaved={watchlistSaved}
        isWatchlistLoading={isWatchlistLoading}
        selectedReaction={selectedReaction}
        onWatchlist={handleWatchlistClick}
        onWriteReview={scrollToReviews}
        onTrailer={() => setIsTrailerOpen(true)}
        onShare={handleShare}
      />

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        title={title}
        trailerEmbedUrl={trailerEmbedUrl}
      />

      <div className="md-page-body">
        <MovieStreamingSection providers={uniqueProviders} />

        <MovieCommunityReactions
          selectedReaction={selectedReaction}
          reactionCounts={reactionCounts}
          onReact={handleReaction}
        />

        <MovieCastSection
          cast={(cast || []).filter((actor) => actor && (actor.name || actor.character))}
          directors={(directors || []).filter(Boolean)}
          writers={(writers || []).filter(Boolean)}
          crew={(crew || []).filter(Boolean)}
        />

        <MovieReviewsSection
          movieId={currentMovieId}
          onReviewChange={handleReviewChange}
        />

        <MovieMetadataPanel
          releaseDate={releaseDate}
          runtime={runtime}
          language={language}
          spokenLanguages={spokenLanguages}
          subtitleLanguages={subtitleLanguages}
          productionCountries={productionCountries}
          status={status}
          genres={genres}
          keywords={keywords}
        />

        <MovieSimilarGrid movies={similarMovies} isLoading={isSimilarLoading} />
      </div>
    </div>
  )
}

export default MovieDetailsPage
