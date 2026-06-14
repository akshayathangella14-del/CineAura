import { Sparkles } from 'lucide-react'
import AuraSectionReveal from './AuraSectionReveal'
import { buildWhatSurprisedUs } from '../../utils/auraPresentation'

const WhatSurprisedUs = ({ aura }) => {
  const surprise = buildWhatSurprisedUs(aura)
  if (!surprise.available) return null

  return (
    <AuraSectionReveal className="aura-card aura-card--surprise" delay={0.05}>
      <div className="aura-card__header">
        <Sparkles size={22} />
        <span className="aura-card__label">What Surprised Us</span>
      </div>

      <blockquote className="aura-surprise">
        <p className="aura-surprise__opener">{surprise.opener}</p>
        {surprise.punch && <p className="aura-surprise__punch">{surprise.punch}</p>}
        {surprise.evidence && (
          <footer className="aura-surprise__evidence">{surprise.evidence}</footer>
        )}
      </blockquote>
    </AuraSectionReveal>
  )
}

export default WhatSurprisedUs
