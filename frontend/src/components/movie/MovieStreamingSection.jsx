import { Play, ExternalLink } from 'lucide-react'
import { getImageUrl } from '../../utils/formatters'
import './MovieStreamingSection.css'

const ProviderCard = ({ provider }) => {
  const content = (
    <>
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
      {provider.watchUrl && (
        <div className="movie-streaming-card__link-icon">
          <ExternalLink size={14} />
        </div>
      )}
    </>
  )

  if (provider.watchUrl) {
    return (
      <a
        href={provider.watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="movie-streaming-card movie-streaming-card--clickable"
        title={`Watch on ${provider.providerName}`}
      >
        {content}
      </a>
    )
  }

  return (
    <article className="movie-streaming-card">
      {content}
    </article>
  )
}

const MovieStreamingSection = ({ providers = [] }) => {
  if (!providers.length) return null

  return (
    <section className="movie-streaming-section" aria-label="Where to watch">
      <h2 className="md-section-title">Where to Watch</h2>
      <p className="movie-streaming-section__subtitle">Streaming availability for this title</p>

      <div className="movie-streaming-section__grid">
        {providers.map((provider) => (
          <ProviderCard
            key={`${provider.providerName}-${provider.type}`}
            provider={provider}
          />
        ))}
      </div>
    </section>
  )
}

export default MovieStreamingSection