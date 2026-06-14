import { ScrollText } from 'lucide-react'
import AuraSectionReveal from './AuraSectionReveal'

const WhyThisAuraExists = ({ whyThisAuraExists }) => {
  if (!whyThisAuraExists) return null

  const { summary, evidence = [], explanation } = whyThisAuraExists

  return (
    <AuraSectionReveal className="aura-card aura-card--finale" delay={0.15}>
      <div className="aura-finale__fade" aria-hidden="true" />
      <div className="aura-card__header">
        <ScrollText size={22} />
        <span className="aura-card__label">Why This Aura Exists</span>
      </div>

      <p className="aura-finale__intro">The closing chapter.</p>

      {summary && <p className="aura-finale__summary">{summary}</p>}

      {evidence.length > 0 && (
        <>
          <p className="aura-finale__evidence-label">The evidence</p>
          <ul className="aura-evidence-list aura-evidence-list--finale">
            {evidence.map((item) => (
              <li key={`${item.type}-${item.detail}`}>
                <span className="aura-evidence-list__type">{item.type.replace(/_/g, ' ')}</span>
                <span>{item.detail}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {explanation && (
        <p className="aura-finale__footnote">{explanation}</p>
      )}
    </AuraSectionReveal>
  )
}

export default WhyThisAuraExists
