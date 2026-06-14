import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search as SearchIcon, TrendingUp, Tag, Globe, Calendar, Star, Film, X } from 'lucide-react'
import useSearchStore from '../store/searchStore'
import useAuthStore from '../store/authStore'
import useMovieStore from '../store/movieStore'
import movieService from '../services/movieService'
import CineAuraLoader from '../components/common/CineAuraLoader'
import MovieCard from '../components/movie/MovieCard'
import MovieRow from '../components/movie/MovieRow'
import SectionHeader from '../components/common/SectionHeader'
import SearchBar from '../components/common/SearchBar'
import './SearchPage.css'

const getParamList = (params, key) => {
  const value = params.get(key)
  if (!value) return []

  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

const sameList = (first = [], second = []) => {
  if (first.length !== second.length) return false

  for (const item of first) {
    if (!second.includes(item)) return false
  }

  return true
}

const SearchPage = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [popularGenres, setPopularGenres] = useState([])
  const [showAllGenres, setShowAllGenres] = useState(false)
  const [showAllYears, setShowAllYears] = useState(false)
  const [popularLanguages, setPopularLanguages] = useState([])
  const [trendingSearches, setTrendingSearches] = useState([])
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false)

  const recentYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017']
  const olderYears = Array.from({ length: 37 }, (_, index) => String(2016 - index))
  const visibleYears = showAllYears ? [...recentYears, ...olderYears] : recentYears

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'Telugu' },
    { code: 'ta', label: 'Tamil' },
    { code: 'hi', label: 'Hindi' },
    { code: 'ml', label: 'Malayalam' },
    { code: 'kn', label: 'Kannada' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'zh', label: 'Chinese' },
    { code: 'cn', label: 'Chinese' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
  ]

  const languageMap = languageOptions.reduce((map, option) => {
    map[option.code] = option.label
    return map
  }, {})

  const languageAliases = {
    en: 'English',
    hi: 'Hindi',
    te: 'Telugu',
    ta: 'Tamil',
    ml: 'Malayalam',
    kn: 'Kannada',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    cn: 'Chinese',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
  }

  const getLanguageLabel = (code) => languageAliases[String(code || '').toLowerCase()] || null

  const normalizeLanguageFilter = (language) => {
    const value = String(language || '').trim()
    const code = value.toLowerCase()
    if (getLanguageLabel(code)) return code

    const option = languageOptions.find(item => item.label.toLowerCase() === value.toLowerCase())
    return option?.code || null
  }

  const normalizeLanguageCode = (language) => {
    const raw = typeof language === 'object'
      ? language.code || language.iso_639_1 || language.id || language.language
      : language
    const code = String(raw || '').toLowerCase()
    if (!getLanguageLabel(code)) return null
    return code
  }
  
  const query = useSearchStore((s) => s.query)
  const filters = useSearchStore((s) => s.filters)
  const setQuery = useSearchStore((s) => s.setQuery)
  const setFilters = useSearchStore((s) => s.setFilters)
  const toggleFilter = useSearchStore((s) => s.toggleFilter)
  const clearFilters = useSearchStore((s) => s.clearFilters)
  const results = useSearchStore((s) => s.results)
  const isLoading = useSearchStore((s) => s.isLoading)
  const setResults = useSearchStore((s) => s.setResults)
  const appendResults = useSearchStore((s) => s.appendResults)
  const setLoading = useSearchStore((s) => s.setLoading)
  const clearResults = useSearchStore((s) => s.clearResults)
  const pagination = useSearchStore((s) => s.pagination)
  const setPagination = useSearchStore((s) => s.setPagination)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const upcomingMovies = useMovieStore((s) => s.upcomingMovies)
  const topRatedMovies = useMovieStore((s) => s.topRatedMovies)
  const fetchTopRated = useMovieStore((s) => s.fetchTopRated)
  const fetchUpcoming = useMovieStore((s) => s.fetchUpcoming)
  const isSearchFocused = useSearchStore((s) => s.isSearchFocused)
  const hasCommittedSearch = useSearchStore((s) => s.hasCommittedSearch)
  const setHasCommittedSearch = useSearchStore((s) => s.setHasCommittedSearch)

  const hasFilters =
    filters.genres.length > 0 ||
    filters.languages.length > 0 ||
    filters.years.length > 0

  const hasSearch = query.trim() || hasFilters

  // UI State Model
  // Discovery: !isSearchFocused && !hasCommittedSearch
  // Exploration: isSearchFocused && !hasCommittedSearch
  // Results: hasCommittedSearch
  const isDiscoveryMode = !isSearchFocused && !hasCommittedSearch
  const isExplorationMode = isSearchFocused && !hasCommittedSearch
  const isResultsMode = hasCommittedSearch

  const getSearchParams = useCallback((page = 1) => {
    const params = {
      page,
      limit: 20,
    }

    if (query.trim()) params.q = query.trim()
    if (filters.genres.length > 0) params.genres = filters.genres.join(',')
    if (filters.languages.length > 0) params.languages = filters.languages.join(',')
    if (filters.years.length > 0) params.years = filters.years.join(',')

    return params
  }, [query, filters])

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams()

    if (query.trim()) params.set('q', query.trim())
    if (filters.genres.length > 0) params.set('genres', filters.genres.join(','))
    if (filters.languages.length > 0) params.set('languages', filters.languages.join(','))
    if (filters.years.length > 0) params.set('years', filters.years.join(','))

    const queryString = params.toString()
    return queryString ? `/search?${queryString}` : '/search'
  }, [query, filters])

  // Fetch Dynamic Metadata
  useEffect(() => {
    movieService.getSearchMetadata().then(res => {
      const { genres, languages } = res.data?.payload || {}
      if (genres) setPopularGenres(genres)
      
      if (languages) {
        const availableCodes = new Set(languages.map(normalizeLanguageCode).filter(Boolean))
        const readableLangs = languageOptions
          .filter(({ code }) => availableCodes.has(code))
          .filter((option, index, list) => list.findIndex(item => item.label === option.label) === index)
        setPopularLanguages(readableLangs)
      }
    }).catch(console.error)

    movieService.getTrending().then(res => {
      const titles = (res.data?.payload || []).slice(0, 8).map(m => m.title)
      setTrendingSearches(titles)
    }).catch(console.error)

    // Fetch discovery sections
    setIsLoadingDiscovery(true)
    Promise.all([fetchUpcoming(), fetchTopRated()]).finally(() => {
      setIsLoadingDiscovery(false)
    })
  }, [fetchUpcoming, fetchTopRated])

  // Read URL Search State
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const store = useSearchStore.getState()
    const urlQuery = params.get('q') || ''
    const urlFilters = {
      genres: getParamList(params, 'genres'),
      languages: getParamList(params, 'languages')
        .map(normalizeLanguageFilter)
        .filter(Boolean),
      years: getParamList(params, 'years').filter(year => /^\d{4}$/.test(year)),
    }

    // Determine if URL has committed search parameters
    const hasUrlSearch = urlQuery.trim() || 
      urlFilters.genres.length > 0 || 
      urlFilters.languages.length > 0 || 
      urlFilters.years.length > 0

    setHasCommittedSearch(hasUrlSearch)

    if (urlQuery !== store.query) {
      setQuery(urlQuery)
    }

    if (
      !sameList(urlFilters.genres, store.filters.genres) ||
      !sameList(urlFilters.languages, store.filters.languages) ||
      !sameList(urlFilters.years, store.filters.years)
    ) {
      setFilters(urlFilters)
    }

  }, [location.search, setQuery, setFilters])

  // Search Movies (only in Results Mode)
  useEffect(() => {
    const fetchSearch = async () => {
      if (!hasCommittedSearch) {
        clearResults()
        return
      }

      if (!hasSearch) {
        clearResults()
        return
      }

      setLoading(true)
      try {
        const nextUrl = buildUrl()
        const currentUrl = `${location.pathname}${location.search}`

        if (location.pathname === '/search' && nextUrl !== currentUrl) {
          navigate(nextUrl, { replace: true })
        }

        const res = await movieService.searchMovies(getSearchParams(1))
        const payload = res.data?.payload
        const total = res.data?.totalResults || 0

        if (Array.isArray(payload)) {
          setResults(payload)
        } else {
          setResults([])
        }

        setPagination({ page: 1, totalResults: total, limit: 20 })

        if (isAuthenticated && query.trim()) {
          movieService.saveInteraction({
            interactionType: 'search_query',
            query: query.trim(),
            source: 'search-page',
            metadata: { filters },
          }).catch(() => {})
        }
      } catch (err) {
        console.error('Search failed:', err)
        setResults([])
        setPagination({ page: 1, totalResults: 0 })
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchSearch, 500)
    return () => clearTimeout(timeoutId)
  }, [query, filters, hasCommittedSearch, hasSearch, isAuthenticated, buildUrl, getSearchParams, location.pathname, location.search, navigate, setResults, setLoading, clearResults, setPagination])

  const handleLoadMore = async () => {
    if (isLoading) return
    const nextPage = pagination.page + 1

    setLoading(true)
    try {
      const res = await movieService.searchMovies(getSearchParams(nextPage))
      const payload = res.data?.payload

      if (Array.isArray(payload) && payload.length > 0) {
        appendResults(payload)
        setPagination({ page: nextPage, totalResults: res.data?.totalResults || pagination.totalResults })
      }
    } catch (err) {
      console.error('Failed to load more:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTextChipClick = (term) => {
    setQuery(term)
    setHasCommittedSearch(true)
    navigate(`/search?q=${encodeURIComponent(term)}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFilterClick = (filterType, term) => {
    toggleFilter(filterType, term)
    setHasCommittedSearch(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearAll = () => {
    setQuery('')
    clearFilters()
    clearResults()
    setHasCommittedSearch(false)
    navigate('/search')
  }

  const renderFilterControls = () => {
    const visibleGenres = showAllGenres ? popularGenres : popularGenres.slice(0, 12)
    const visibleYears = showAllYears ? [...recentYears, ...olderYears.slice(0, 20)] : recentYears
    
    const activeFilterCount = filters.genres.length + filters.languages.length + filters.years.length
    
    return (
      <div className="search-page__filter-panel">
        <div className="search-page__filter-header">
          <span className="search-page__filter-title">Filters</span>
          {activeFilterCount > 0 && (
            <button className="search-page__clear-filters" onClick={handleClearAll}>
              Clear All
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="search-page__active-filters">
            {filters.genres.map(term => (
              <button key={term} className="search-page__active-filter" onClick={() => handleFilterClick('genres', term)}>
                {term}
                <X size={14} />
              </button>
            ))}
            {filters.languages.map(code => (
              <button key={code} className="search-page__active-filter" onClick={() => handleFilterClick('languages', code)}>
                {languageMap[code] || code}
                <X size={14} />
              </button>
            ))}
            {filters.years.map(term => (
              <button key={term} className="search-page__active-filter" onClick={() => handleFilterClick('years', term)}>
                {term}
                <X size={14} />
              </button>
            ))}
          </div>
        )}

        <div className="search-page__filter-row">
          <div className="search-page__filter-section">
            <span className="search-page__filter-label">Genres</span>
            <div className="search-page__chips search-page__chips--compact">
              {visibleGenres.map(term => (
                <button
                  key={term}
                  className={`search-page__chip ${filters.genres.includes(term) ? 'search-page__chip--active' : ''}`}
                  onClick={() => handleFilterClick('genres', term)}
                >
                  {term}
                </button>
              ))}
              {popularGenres.length > 12 && (
                <button 
                  className="search-page__chip search-page__chip--toggle"
                  onClick={() => setShowAllGenres(!showAllGenres)}
                >
                  {showAllGenres ? 'Show Less' : `+${popularGenres.length - 12}`}
                </button>
              )}
            </div>
          </div>

          <div className="search-page__filter-section">
            <span className="search-page__filter-label">Languages</span>
            <div className="search-page__chips search-page__chips--compact">
              {popularLanguages.map(({ code, label }) => (
                <button
                  key={code}
                  className={`search-page__chip ${filters.languages.includes(code) ? 'search-page__chip--active' : ''}`}
                  onClick={() => handleFilterClick('languages', code)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="search-page__filter-section">
            <span className="search-page__filter-label">Years</span>
            <div className="search-page__chips search-page__chips--compact">
              {visibleYears.map(term => (
                <button
                  key={term}
                  className={`search-page__chip ${filters.years.includes(term) ? 'search-page__chip--active' : ''}`}
                  onClick={() => handleFilterClick('years', term)}
                >
                  {term}
                </button>
              ))}
              <button
                className="search-page__chip search-page__chip--toggle"
                onClick={() => setShowAllYears(!showAllYears)}
              >
                {showAllYears ? 'Show Less' : 'More'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderDiscoveryState = () => (
    <div className="search-page__discovery">
      <div className="search-page__sections">
        <section className="search-page__section">
          <SectionHeader title="Trending Searches" icon={TrendingUp} />
          <div className="search-page__trending-pills">
            {trendingSearches.map(term => (
              <button key={term} className="search-page__trending-pill" onClick={() => handleTextChipClick(term)}>
                <TrendingUp size={14} className="search-page__trending-icon" />
                <span>{term}</span>
              </button>
            ))}
          </div>
        </section>

        {upcomingMovies && upcomingMovies.length > 0 && (
          <section className="search-page__section">
            <SectionHeader title="New Releases" icon={Film} />
            <MovieRow movies={upcomingMovies} isLoading={isLoadingDiscovery} rowId="search-new" />
          </section>
        )}

        {topRatedMovies && topRatedMovies.length > 0 && (
          <section className="search-page__section">
            <SectionHeader title="Top Rated Masterpieces" icon={Star} />
            <MovieRow movies={topRatedMovies} isLoading={isLoadingDiscovery} rowId="search-top" />
          </section>
        )}
      </div>
    </div>
  )

  const renderLoadingState = () => (
    <CineAuraLoader variant="page" />
  )

  const renderEmptyState = () => (
    <div className="search-page__empty">
        <div className="search-page__empty-icon">
          <SearchIcon size={48} strokeWidth={1.5} />
        </div>
        <h2>No results found for "{query.trim()}"</h2>
        <p>We couldn't find any movies matching your search.</p>

        <div className="search-page__empty-suggestions">
          <span className="search-page__empty-suggestions-label">Suggestions:</span>
          <ul className="search-page__empty-list">
            <li>Check your spelling</li>
            <li>Try broader keywords</li>
            <li>Remove some filters</li>
            <li>Search for a movie title, actor, or genre</li>
          </ul>
          <div className="search-page__chips search-page__chips--center">
            {['Action', 'Drama', '2024', 'Telugu'].map(term => (
              <button key={term} className="search-page__chip" onClick={() => handleTextChipClick(term)}>
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
  )

  const renderResultsState = () => (
    <>
      <div className="search-page__results-header">
        <h1>Results</h1>
        <div className="search-page__results-meta">
          <span className="search-page__count">{pagination.totalResults || results.length} results found</span>
          {query.trim() && <span className="search-page__query">for "{query.trim()}"</span>}
        </div>
      </div>

      <motion.div
        className="search-page__grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {results.map((movie, index) => (
          <MovieCard key={movie._id || movie.tmdbId} movie={movie} index={index} />
        ))}
      </motion.div>

      {results.length < pagination.totalResults && (
        <div className="search-page__load-more-container">
          <button
            className="search-page__load-more-btn"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="search-page__loading-text">Loading...</span>
            ) : 'Load More'}
          </button>
        </div>
      )}
    </>
  )

  return (
    <div className="search-page" id="page-search">
      <div className="search-page__content">
        {!isDiscoveryMode && renderFilterControls()}
        
        {!isResultsMode && renderDiscoveryState()}
        
        {isResultsMode && (
          isLoading && pagination.page === 1 ? (
            renderLoadingState()
          ) : results?.length > 0 ? (
            renderResultsState()
          ) : (
            renderEmptyState()
          )
        )}
      </div>
    </div>
  )
}

export default SearchPage
