import { Heart, Flame, Sparkles, Star, Zap } from 'lucide-react'
import { getImageUrl } from '../../utils/formatters'
import AuraSectionReveal from './AuraSectionReveal'

const REACTION_ICONS = {
  'Loved It': Heart,
  Emotional: Heart,
  Intense: Flame,
  'Mind Blown': Sparkles,
  Favorite: Star,
}

const EmotionalResonance = ({ emotionalResonance = [] }) => {
  if (!emotionalResonance.length) return null

  const clusters = emotionalResonance.slice(0, 3)

  return (
    <AuraSectionReveal className="aura-card aura-card--resonance aura-card--compact" delay={0.12}>
      <div className="aura-card__header">
        <Zap size={20} />
        <span className="aura-card__label">Emotional Resonance</span>
      </div>

      <div className="aura-resonance-compact">
        {clusters.map((entry) => {
          const Icon = REACTION_ICONS[entry.reaction] || Heart
          const leadMovie = entry.movies?.[0]
          const poster = leadMovie
            ? getImageUrl(leadMovie.poster || leadMovie.posterOriginal || leadMovie.posterPath, 'w92')
            : null
          const genreLine = (entry.topGenres || []).slice(0, 2).join(' · ')
          const themeLine = (entry.topThemes || []).slice(0, 1).join('')

          return (
            <article key={entry.reaction} className="aura-resonance-cluster">
              {poster && (
                <img
                  src={poster}
                  alt={leadMovie.title}
                  className="aura-resonance-cluster__poster"
                />
              )}
              <div className="aura-resonance-cluster__body">
                <div className="aura-resonance-cluster__head">
                  <Icon size={16} />
                  <strong>{entry.reaction}</strong>
                  <span>{entry.evidenceCount}×</span>
                </div>
                {(genreLine || themeLine) && (
                  <p className="aura-resonance-cluster__meta">
                    {[genreLine, themeLine].filter(Boolean).join(' · ')}
                  </p>
                )}
                {leadMovie?.title && (
                  <span className="aura-resonance-cluster__film">{leadMovie.title}</span>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </AuraSectionReveal>
  )
}

export default EmotionalResonance
