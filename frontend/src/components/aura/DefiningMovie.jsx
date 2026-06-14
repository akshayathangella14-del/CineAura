import { Film } from 'lucide-react'
import { getImageUrl, getYear } from '../../utils/formatters'
import AuraSectionReveal from './AuraSectionReveal'

const DefiningMovie = ({ definingMovie }) => {
  if (!definingMovie?.movie) return null

  const { movie, signalScore, signals = [] } = definingMovie
  const poster = getImageUrl(movie.poster || movie.posterOriginal || movie.posterPath, 'w342')
  const year = getYear(movie.releaseYear || movie.releaseDate)

  return (
    <AuraSectionReveal className="aura-card aura-card--defining" delay={0.1}>
      <div className="aura-card__header">
        <Film size={22} />
        <span className="aura-card__label">The Movie That Defined You</span>
      </div>

      <div className="aura-defining-movie">
        {poster && (
          <div className="aura-defining-movie__poster-wrap">
            <img src={poster} alt={movie.title} className="aura-defining-movie__poster" />
            <div className="aura-defining-movie__glow" aria-hidden="true" />
            <div className="aura-defining-movie__frame" aria-hidden="true" />
          </div>
        )}
        <div className="aura-defining-movie__body">
          <h3>{movie.title}</h3>
          {year && <span className="aura-defining-movie__year">{year}</span>}
          <p className="aura-defining-movie__narrative">
            Among everything you&apos;ve engaged with,
            this film left the deepest fingerprint on your cinematic identity.
          </p>
          {signalScore != null && (
            <p className="aura-defining-movie__evidence">
              {signalScore} combined evidence point{signalScore === 1 ? '' : 's'} from your activity.
            </p>
          )}
          {signals.length > 0 && (
            <div className="aura-signal-tags">
              {signals.map((signal) => (
                <span key={signal} className="aura-signal-tag">{signal}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuraSectionReveal>
  )
}

export default DefiningMovie
