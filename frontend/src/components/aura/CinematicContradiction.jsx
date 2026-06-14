import { GitBranch } from 'lucide-react'
import AuraSectionReveal from './AuraSectionReveal'

const CinematicContradiction = ({ contradictions = [] }) => {
  if (!contradictions.length) return null

  return (
    <AuraSectionReveal className="aura-card">
      <div className="aura-card__header">
        <GitBranch size={22} />
        <span className="aura-card__label">Cinematic Contradiction</span>
      </div>
      <p className="aura-card__lead">Tension in your taste — backed by cross-signal evidence.</p>

      <div className="aura-contradiction-list">
        {contradictions.map((item) => (
          <article key={`${item.type}-${item.statement}`} className="aura-contradiction-item">
            <p className="aura-contradiction-item__statement">{item.statement}</p>
            <div className="aura-contradiction-item__evidence">
              {(item.evidence || []).map((ev) => (
                <span key={`${ev.label}-${ev.source}`} className="aura-contradiction-evidence">
                  <strong>{ev.label}</strong>
                  <span>{ev.evidenceCount} · {ev.source}</span>
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </AuraSectionReveal>
  )
}

export default CinematicContradiction
