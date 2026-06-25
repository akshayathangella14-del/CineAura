import { useState } from 'react'
import { Calendar, Clock, Globe, Tag, Film, MapPin, Info, Captions, Volume2 } from 'lucide-react'
import { formatDate, formatRuntime, formatLanguage, formatLanguageList } from '../../utils/formatters'
import './MovieMetadataPanel.css'

const getCountryCode = (name) => {
  const codes = {
    'United States of America': 'us',
    'United Kingdom': 'gb',
    'France': 'fr',
    'Japan': 'jp',
    'South Korea': 'kr',
    'India': 'in',
    'Canada': 'ca',
    'Germany': 'de',
    'Italy': 'it',
    'Spain': 'es',
    'Australia': 'au',
    'China': 'cn',
    'Mexico': 'mx',
    'Russia': 'ru',
    'Brazil': 'br',
    'New Zealand': 'nz',
    'Sweden': 'se',
    'Denmark': 'dk',
    'Norway': 'no',
    'Finland': 'fi',
    'Ireland': 'ie'
  }
  return codes[name] || null
}

const CollapsibleChipGroup = ({ chips, limit = 4, icon: Icon, label }) => {
  const [expanded, setExpanded] = useState(false)
  if (!chips || chips.length === 0) return null
  
  const visible = expanded ? chips : chips.slice(0, limit)
  const remainder = chips.length - limit

  return (
    <div className="movie-metadata-panel__group">
      <div className="movie-metadata-panel__item-head">
        {Icon && <Icon size={16} />}
        <span>{label}</span>
      </div>
      <div className="movie-metadata-panel__chips">
        {visible.map(c => <span key={c} className="movie-metadata-panel__chip">{c}</span>)}
        {!expanded && remainder > 0 && (
          <button 
            className="movie-metadata-panel__chip movie-metadata-panel__chip--more" 
            onClick={() => setExpanded(true)}
          >
            +{remainder} More
          </button>
        )}
      </div>
    </div>
  )
}

const MovieMetadataPanel = ({
  releaseDate,
  runtime,
  language,
  spokenLanguages = [],
  subtitleLanguages = [],
  productionCountries = [],
  status,
  genres = [],
  keywords = [],
}) => {
  const parsedGenres = Array.isArray(genres)
    ? genres.map((g) => (typeof g === 'object' ? g.name : g)).filter(Boolean)
    : []

  const parsedKeywords = Array.isArray(keywords)
    ? keywords.map((k) => (typeof k === 'object' ? k.name : k)).filter(Boolean)
    : []

  const audioLanguages = formatLanguageList(spokenLanguages)
  const subtitleList = formatLanguageList(subtitleLanguages)

  const hasCore = releaseDate || runtime > 0 || language || productionCountries.length > 0 || status || parsedGenres.length > 0
  const hasLang = audioLanguages.length > 0 || subtitleList.length > 0
  const hasKeywords = parsedKeywords.length > 0

  if (!hasCore && !hasLang && !hasKeywords) return null

  return (
    <section className="movie-metadata-panel--premium" aria-label="Movie facts">
      
      {/* ZONE 1: Core Facts */}
      {hasCore && (
        <div className="movie-metadata-panel__zone">
          <h2 className="movie-metadata-panel__zone-title">Film Facts</h2>
          <div className="movie-metadata-panel__grid">
            {releaseDate && (
              <div className="movie-metadata-panel__item">
                <div className="movie-metadata-panel__item-head"><Calendar size={16} /><span>Release Date</span></div>
                <p className="movie-metadata-panel__value">{formatDate(releaseDate)}</p>
              </div>
            )}
            {runtime > 0 && (
              <div className="movie-metadata-panel__item">
                <div className="movie-metadata-panel__item-head"><Clock size={16} /><span>Runtime</span></div>
                <p className="movie-metadata-panel__value">{formatRuntime(runtime)}</p>
              </div>
            )}
            {productionCountries.length > 0 && (
              <div className="movie-metadata-panel__item">
                <div className="movie-metadata-panel__item-head"><MapPin size={16} /><span>Country</span></div>
                <div className="movie-metadata-panel__tags">
                  {productionCountries.map(c => {
                    const code = getCountryCode(c);
                    return (
                      <span key={c} className="movie-metadata-panel__tag">
                        {code && (
                          <img 
                            src={`https://flagcdn.com/w20/${code}.png`} 
                            srcSet={`https://flagcdn.com/w40/${code}.png 2x`} 
                            alt={`${c} flag`} 
                          />
                        )}
                        {c}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
            {status && (
              <div className="movie-metadata-panel__item">
                <div className="movie-metadata-panel__item-head"><Info size={16} /><span>Status</span></div>
                <p className="movie-metadata-panel__value">{status}</p>
              </div>
            )}
            {parsedGenres.length > 0 && (
              <div className="movie-metadata-panel__item movie-metadata-panel__item--full">
                <div className="movie-metadata-panel__item-head"><Film size={16} /><span>Genres</span></div>
                <div className="movie-metadata-panel__tags">
                  {parsedGenres.map(g => <span key={g} className="movie-metadata-panel__genre-chip">{g}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ZONE 2: Languages & Availability */}
      {hasLang && (
        <div className="movie-metadata-panel__zone">
          <h2 className="movie-metadata-panel__zone-title">Languages & Availability</h2>
          <div className="movie-metadata-panel__lang-grid">
            {language && (
              <div className="movie-metadata-panel__group">
                <div className="movie-metadata-panel__item-head"><Globe size={16} /><span>Original Language</span></div>
                <p className="movie-metadata-panel__value">{formatLanguage(language)}</p>
              </div>
            )}
            {audioLanguages.length > 0 && (
              <CollapsibleChipGroup chips={audioLanguages} limit={4} icon={Volume2} label="Available Audio" />
            )}
            {subtitleList.length > 0 && (
              <CollapsibleChipGroup chips={subtitleList} limit={6} icon={Captions} label="Available Subtitles" />
            )}
          </div>
        </div>
      )}

      {/* ZONE 3: Keywords */}
      {hasKeywords && (
        <div className="movie-metadata-panel__zone movie-metadata-panel__zone--keywords">
          <h2 className="movie-metadata-panel__zone-title"><Tag size={16} className="inline-icon"/> Keywords</h2>
          <div className="movie-metadata-panel__keywords-list">
            {parsedKeywords.map(k => (
              <span key={k} className="movie-metadata-panel__keyword-pill">{k}</span>
            ))}
          </div>
        </div>
      )}

    </section>
  )
}

export default MovieMetadataPanel
