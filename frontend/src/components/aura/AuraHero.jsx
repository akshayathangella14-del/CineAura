import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import {
  REVEAL_SEQUENCE,
  getRevealTierLabel,
  getAuraTitle,
  buildEmotionalHeroCopy,
} from '../../utils/auraPresentation'
import AuraConfidenceBadge from './AuraConfidenceBadge'
import AuraParticles from './AuraParticles'

const STEP_MS = 1300
const TIER_DELAY_MS = 500
const TITLE_DELAY_MS = 900

const AuraHero = ({ aura }) => {
  const reducedMotion = usePrefersReducedMotion()
  const [stepIndex, setStepIndex] = useState(reducedMotion ? REVEAL_SEQUENCE.length : 0)
  const [showTier, setShowTier] = useState(reducedMotion)
  const [showTitle, setShowTitle] = useState(reducedMotion)
  const [showCopy, setShowCopy] = useState(reducedMotion)

  const { main: titleMain, suffix: titleSuffix } = getAuraTitle(aura)
  const tierLabel = getRevealTierLabel(aura)
  const emotionalCopy = buildEmotionalHeroCopy(aura)
  const sequenceDone = stepIndex >= REVEAL_SEQUENCE.length

  useEffect(() => {
    if (reducedMotion) return undefined

    if (stepIndex < REVEAL_SEQUENCE.length) {
      const timer = setTimeout(() => setStepIndex((i) => i + 1), STEP_MS)
      return () => clearTimeout(timer)
    }

    const tierTimer = setTimeout(() => setShowTier(true), TIER_DELAY_MS)
    const titleTimer = setTimeout(() => setShowTitle(true), TIER_DELAY_MS + TITLE_DELAY_MS)
    const copyTimer = setTimeout(() => setShowCopy(true), TIER_DELAY_MS + TITLE_DELAY_MS + 400)

    return () => {
      clearTimeout(tierTimer)
      clearTimeout(titleTimer)
      clearTimeout(copyTimer)
    }
  }, [stepIndex, reducedMotion])

  return (
    <header className="aura-hero aura-hero--reveal">
      <div className="aura-hero__gradient-shift" aria-hidden="true" />
      <div className="aura-hero__glow" aria-hidden="true" />
      <div className="aura-hero__glow aura-hero__glow--secondary" aria-hidden="true" />
      <AuraParticles disabled={reducedMotion} />

      <div className="aura-hero__content">
        <div className="aura-hero__icon">
          <Sparkles size={32} />
        </div>

        <span className="aura-hero__eyebrow">Your Cinematic Personality</span>

        {!sequenceDone && !reducedMotion && (
          <p className="aura-hero__sequence" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.span
                key={REVEAL_SEQUENCE[stepIndex]}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                {REVEAL_SEQUENCE[stepIndex]}
              </motion.span>
            </AnimatePresence>
          </p>
        )}

        {(sequenceDone || reducedMotion) && (
          <>
            <AnimatePresence>
              {showTier && (
                <motion.p
                  className="aura-hero__tier-reveal"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  {tierLabel}
                </motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showTitle && (
                <motion.h1
                  className="aura-hero__title aura-hero__title--reveal"
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                >
                  {titleMain}
                  {titleSuffix && (
                    <span className="aura-hero__title-suffix">{titleSuffix}</span>
                  )}
                </motion.h1>
              )}
            </AnimatePresence>

            <AuraConfidenceBadge
              confidence={aura.confidence}
              auraState={aura.auraState}
            />

            <AnimatePresence>
              {showCopy && emotionalCopy.lines.length > 0 && (
                <motion.div
                  className="aura-hero__emotional-copy"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {emotionalCopy.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </header>
  )
}

export default AuraHero
