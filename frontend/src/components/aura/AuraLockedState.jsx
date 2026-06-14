import { motion } from 'framer-motion'
import { Lock, Sparkles } from 'lucide-react'
import AuraConfidenceBadge from './AuraConfidenceBadge'

const AuraLockedState = ({ aura }) => (
  <div id="page-aura" className="aura-page aura-page--locked">
    <motion.section
      className="aura-hero aura-hero--locked"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="aura-hero__glow" aria-hidden="true" />
      <div className="aura-hero__icon aura-hero__icon--locked">
        <Lock size={30} />
      </div>
      <span className="aura-hero__eyebrow">Cinematic Fingerprint</span>
      <AuraConfidenceBadge confidence={aura.confidence} auraState="locked" />
      <h1 className="aura-hero__title">{aura.title || 'Aura Locked'}</h1>
      <p className="aura-hero__tagline">{aura.description}</p>
    </motion.section>

    <section className="aura-card aura-card--unlock">
      <div className="aura-card__header">
        <Sparkles size={22} />
        <h2>How Your Aura Forms</h2>
      </div>
      <p className="aura-card__lead">
        Aura is built only from real viewing behavior — never guesses. Each action below adds evidence to your cinematic personality.
      </p>
      <ul className="aura-unlock-list">
        {(aura.unlockRequirements || []).map((req) => (
          <li key={req}>{req}</li>
        ))}
      </ul>
    </section>

    <section className="aura-preview-blur" aria-hidden="true">
      <div className="aura-preview-blur__inner">
        <span>Hidden Viewing Truth</span>
        <span>Emotional Resonance</span>
        <span>Defining Movie</span>
      </div>
    </section>
  </div>
)

export default AuraLockedState
