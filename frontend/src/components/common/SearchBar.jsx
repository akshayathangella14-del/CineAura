// CineAura SearchBar Component
// Unified global search bar — typeahead suggestions only
// Discovery content lives in SearchPage, not in a dropdown
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Film, User } from 'lucide-react'
import useSearchStore from '../../store/searchStore'
import movieService from '../../services/movieService'
import { getImageUrl, getPersonImage } from '../../utils/formatters'
import './SearchBar.css'

const SearchBar = ({ expanded = false, onToggle }) => {
  const query = useSearchStore((s) => s.query)
  const setQuery = useSearchStore((s) => s.setQuery)
  const suggestions = useSearchStore((s) => s.suggestions)
  const setSuggestions = useSearchStore((s) => s.setSuggestions)
  const clearSuggestions = useSearchStore((s) => s.clearSuggestions)
  const clearResults = useSearchStore((s) => s.clearResults)
  const setIsSearchFocusedGlobal = useSearchStore((s) => s.setIsSearchFocused)
  const setHasCommittedSearch = useSearchStore((s) => s.setHasCommittedSearch)

  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Fetch typeahead suggestions (only when query has text)
  useEffect(() => {
    const fetchSugg = async () => {
      const safeQuery = query || ''
      if (!safeQuery.trim()) {
        clearSuggestions()
        setSelectedIndex(-1)
        return
      }
      try {
        const res = await movieService.getSearchSuggestions({ q: query, limit: 5 })
        if (res.data?.payload && Array.isArray(res.data.payload)) {
          setSuggestions(res.data.payload)
          setSelectedIndex(-1)
        } else {
          setSuggestions([])
          setSelectedIndex(-1)
        }
      } catch (err) {
        console.warn('Failed to fetch suggestions', err)
        setSelectedIndex(-1)
      }
    }
    const timeoutId = setTimeout(fetchSugg, 300)
    return () => clearTimeout(timeoutId)
  }, [query, setSuggestions, clearSuggestions])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsFocused(false)
        setIsSearchFocusedGlobal(false)
      }
    }
    // using click instead of mousedown to not swallow filter clicks on the SearchPage
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [setIsSearchFocusedGlobal])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
  }

  const handleFocus = () => {
    setIsFocused(true)
    setIsSearchFocusedGlobal(true)
    // If search bar is focused with no query, navigate to Search Page (discovery state)
    if (!query?.trim() && location.pathname !== '/search') {
      navigate('/search')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const safeQuery = query?.trim()

    if (!safeQuery) {
      navigate('/search')
      return
    }

    setHasCommittedSearch(true)
    navigate(`/search?q=${encodeURIComponent(safeQuery)}`)
    setIsFocused(false)
  }

  const handleClear = () => {
    setQuery('')
    clearResults()
    clearSuggestions()
    setIsFocused(true)
    setIsSearchFocusedGlobal(true)
    inputRef.current?.focus()

    if (location.pathname === '/search') {
      navigate('/search')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur()
      setIsFocused(false)
      setIsSearchFocusedGlobal(false)
      setSelectedIndex(-1)
      if (onToggle) onToggle(false)
      return
    }

    if (!suggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => {
        if (prev < suggestions.length - 1) return prev + 1
        return prev
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => {
        if (prev > 0) return prev - 1
        return -1
      })
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      const selected = suggestions[selectedIndex]
      if (selected) {
        handleSuggestionClick(selected)
      }
    }
  }

  const handleSuggestionClick = (item) => {
    setIsFocused(false)
    setIsSearchFocusedGlobal(false)
    if (item.mediaType === 'person' || item.knownForDepartment) {
      navigate(`/actors/${item.tmdbId || item._id}`)
    } else {
      navigate(`/movies/${item.tmdbId || item._id}`)
    }
  }


  return (
    <div className={`search-bar ${isFocused ? 'search-bar--focused' : ''} ${expanded ? 'search-bar--expanded' : ''}`}>
      <form onSubmit={handleSubmit} className="search-bar__form" role="search">
        <div className="search-bar__icon-wrapper">
          <Search className="search-bar__icon" size={18} strokeWidth={2} />
        </div>

        <input
          ref={inputRef}
          id="search-input"
          type="text"
          className="search-bar__input"
          placeholder="Search movies, genres, languages, years..."
          value={query || ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-label="Search CineAura"
        />

        <AnimatePresence>
          {query ? (
            <motion.button
              type="button"
              className="search-bar__clear"
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              aria-label="Clear search"
            >
              <X size={16} />
            </motion.button>
          ) : null}
        </AnimatePresence>

        {/* Keyboard shortcut hint */}
        {!query && !isFocused && (
          <div className="search-bar__shortcut">
            <kbd>/</kbd>
          </div>
        )}
      </form>

      {/* Focus glow ring */}
      <div className="search-bar__glow" />

      {/* Typeahead Suggestions — only when user is typing */}
      <AnimatePresence>
        {isFocused && query && suggestions?.length > 0 ? (
          <motion.div
            ref={dropdownRef}
            className="search-bar__dropdown"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            {suggestions.map((item, idx) => {
              const isPerson = item.mediaType === 'person' || item.knownForDepartment
              const imageSrc = isPerson ? getPersonImage(item, 'w92') : getImageUrl(item.poster || item.posterPath, 'w92')
              const isSelected = idx === selectedIndex
              
              return (
                <div 
                  key={item._id || item.tmdbId || idx}
                  className={`search-bar__suggestion-item ${isSelected ? 'search-bar__suggestion-item--selected' : ''}`}
                  onClick={() => handleSuggestionClick(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="search-bar__suggestion-img-wrap">
                    {imageSrc ? (
                      <img src={imageSrc} alt={item.title || item.name} className="search-bar__suggestion-img" />
                    ) : (
                      <div className="search-bar__suggestion-fallback">
                        {isPerson ? <User size={16} /> : <Film size={16} />}
                      </div>
                    )}
                  </div>
                  <div className="search-bar__suggestion-info">
                    <span className="search-bar__suggestion-title">{item.title || item.name}</span>
                    <span className="search-bar__suggestion-meta">
                      {isPerson ? 'Person' : item.releaseYear || (item.releaseDate ? item.releaseDate.substring(0,4) : 'Movie')}
                    </span>
                  </div>
                </div>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default SearchBar
