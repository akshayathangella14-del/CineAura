import { useEffect } from 'react'
import useAuraStore from '../store/auraStore'
import CineAuraLoader from '../components/common/CineAuraLoader'
import AuraLockedState from '../components/aura/AuraLockedState'
import AuraHero from '../components/aura/AuraHero'
import AuraEmergingBanner from '../components/aura/AuraEmergingBanner'
import HiddenViewingTruth from '../components/aura/HiddenViewingTruth'
import WhatSurprisedUs from '../components/aura/WhatSurprisedUs'
import DefiningMovie from '../components/aura/DefiningMovie'
import EmotionalResonance from '../components/aura/EmotionalResonance'
import CinematicContradiction from '../components/aura/CinematicContradiction'
import ThematicGravity from '../components/aura/ThematicGravity'
import WhyThisAuraExists from '../components/aura/WhyThisAuraExists'
import './AuraPage.css'

const AuraPage = () => {
  const fetchAura = useAuraStore((s) => s.fetchAura)
  const aura = useAuraStore((s) => s.aura)
  const isLoading = useAuraStore((s) => s.isLoading)
  const error = useAuraStore((s) => s.error)

  useEffect(() => {
    fetchAura()
  }, [fetchAura])

  if (isLoading || !aura) return <CineAuraLoader variant="page" />

  if (error) {
    return (
      <div id="page-aura" className="aura-page aura-page--error">
        <p>{error}</p>
      </div>
    )
  }

  if (aura.locked) {
    return <AuraLockedState aura={aura} />
  }

  return (
    <div id="page-aura" className="aura-page">
      <AuraHero aura={aura} />

      {aura.auraState === 'emerging' && (
        <AuraEmergingBanner confidence={aura.confidence} />
      )}

      <div className="aura-report">
        <HiddenViewingTruth hiddenTruth={aura.hiddenTruth} />
        <WhatSurprisedUs aura={aura} />
        <DefiningMovie definingMovie={aura.definingMovie} />
        <EmotionalResonance emotionalResonance={aura.emotionalResonance} />
        <CinematicContradiction contradictions={aura.contradictions} />
        <ThematicGravity thematicGravity={aura.thematicGravity} />
        <WhyThisAuraExists whyThisAuraExists={aura.whyThisAuraExists} />
      </div>
    </div>
  )
}

export default AuraPage
