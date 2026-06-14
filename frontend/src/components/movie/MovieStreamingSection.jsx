import { Play } from 'lucide-react'
import { getImageUrl } from '../../utils/formatters'
import './MovieStreamingSection.css'

const MovieStreamingSection = ({ providers = [] }) => {
  if (!providers.length) return null

  return (
    <section className="movie-streaming-section" aria-label="Where to watch">
      <h2 className="md-section-title">Where to Watch</h2>
      <p className="movie-streaming-section__subtitle">Streaming availability for this title</p>

      <div className="movie-streaming-section__grid">
        {providers.map((provider) => (
          <article key={`${provider.providerName}-${provider.type}`} className="movie-streaming-card">
            <div className="movie-streaming-card__logo-wrap">
              {provider.logoUrl ? (
                <img
                  src={getImageUrl(provider.logoUrl, 'w92')}
                  alt=""
                  className="movie-streaming-card__logo"
                />
              ) : (
                <div className="movie-streaming-card__logo-fallback">
                  <Play size={18} />
                </div>
              )}
            </div>
            <div className="movie-streaming-card__info">
              <h3 className="movie-streaming-card__name">{provider.providerName}</h3>
              <p className="movie-streaming-card__type">{provider.type}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default MovieStreamingSection
