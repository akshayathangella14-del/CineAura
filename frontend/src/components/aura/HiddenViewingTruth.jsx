import { Eye } from 'lucide-react'
import AuraSectionReveal from './AuraSectionReveal'
import AuraEvidenceChip from './AuraEvidenceChip'

const HiddenViewingTruth = ({ hiddenTruth }) => {
  if (!hiddenTruth?.available) return null

  const perceivedMovies = hiddenTruth.evidence?.perceivedMovies || []
  const actualMovies = hiddenTruth.evidence?.actualMovies || []

  return (
    <AuraSectionReveal className="aura-card aura-card--truth" delay={0.08}>
      <div className="aura-card__header">
        <Eye size={22} />
        <span className="aura-card__label">Hidden Viewing Truth</span>
      </div>

      <p className="aura-card__insight aura-card__insight--truth">{hiddenTruth.insight}</p>

      <div className="aura-truth-split">
        <div className="aura-truth-split__side">
          <span className="aura-truth-split__label">You explore</span>
          <strong className="aura-truth-split__genre">{hiddenTruth.perceived?.label}</strong>
          <span className="aura-truth-split__source">{hiddenTruth.perceived?.source}</span>
          <div className="aura-evidence-row">
            {perceivedMovies.map((movie) => (
              <AuraEvidenceChip key={movie._id || movie.title} movie={movie} />
            ))}
          </div>
        </div>

        <div className="aura-truth-split__divider" aria-hidden="true">
          <span>but</span>
        </div>

        <div className="aura-truth-split__side">
          <span className="aura-truth-split__label">You respond through</span>
          <strong className="aura-truth-split__genre aura-truth-split__genre--accent">
            {hiddenTruth.actual?.label}
          </strong>
          <span className="aura-truth-split__source">{hiddenTruth.actual?.source}</span>
          <div className="aura-evidence-row">
            {actualMovies.map((movie) => (
              <AuraEvidenceChip key={movie._id || movie.title} movie={movie} />
            ))}
          </div>
        </div>
      </div>
    </AuraSectionReveal>
  )
}

export default HiddenViewingTruth
