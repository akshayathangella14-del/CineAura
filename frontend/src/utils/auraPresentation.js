/**
 * Presentation-layer copy derived only from Aura API payload.
 * No invented stats, genres, or insights.
 */

export const REVEAL_SEQUENCE = [
  'Analyzing your cinematic fingerprint...',
  'Tracing emotional patterns...',
  'Comparing what you explore...',
  '...with what truly moves you',
]

export const getRevealTierLabel = (aura) => {
  if (aura.auraState === 'emerging') return 'YOUR AURA IS EMERGING'
  if (aura.auraState === 'crystallized') return 'YOUR AURA HAS CRYSTALLIZED'
  return (aura.confidence?.tier || 'YOUR AURA').toUpperCase()
}

export const getAuraTitle = (aura) => {
  const raw = aura.signature?.primary || aura.archetype || aura.title || ''
  if (/\sResponder$/i.test(raw)) {
    return {
      main: raw.replace(/\s+Responder$/i, '').trim(),
      suffix: 'Responder',
    }
  }
  return { main: raw, suffix: null }
}

export const buildEmotionalHeroCopy = (aura) => {
  const { hiddenTruth, signature, contradictions } = aura

  if (hiddenTruth?.available && hiddenTruth.perceived?.label && hiddenTruth.actual?.label) {
    return {
      lines: [
        `You search for ${hiddenTruth.perceived.label.toLowerCase()}.`,
        `But you remember ${hiddenTruth.actual.label.toLowerCase()}.`,
      ],
    }
  }

  const contradiction = contradictions?.[0]
  if (contradiction?.evidence?.length >= 2) {
    const browse = contradiction.evidence.find((e) => e.source === 'browsing')
    const react = contradiction.evidence.find((e) => e.source === 'reactions')
    if (browse?.label && react?.label) {
      return {
        lines: [
          `You chase ${browse.label.toLowerCase()}.`,
          `Yet your strongest reactions belong to ${react.label.toLowerCase()}.`,
        ],
      }
    }
  }

  if (
    signature?.explorationGenre &&
    signature?.responseGenre &&
    signature.explorationGenre !== signature.responseGenre
  ) {
    return {
      lines: [
        `You explore through ${signature.explorationGenre.toLowerCase()}.`,
        `But you respond through ${signature.responseGenre.toLowerCase()}.`,
      ],
    }
  }

  if (signature?.responseGenre && signature?.topReaction) {
    return {
      lines: [
        `Your deepest pull is toward ${signature.responseGenre.toLowerCase()}.`,
        `Especially when a film earns your ${signature.topReaction} reaction.`,
      ],
    }
  }

  if (aura.description) {
    return { lines: [aura.description] }
  }

  return { lines: [] }
}

export const buildWhatSurprisedUs = (aura) => {
  const { hiddenTruth, contradictions, emotionalResonance, confidence } = aura

  if (hiddenTruth?.available && hiddenTruth.perceived?.label && hiddenTruth.actual?.label) {
    const intent = hiddenTruth.requiredSignals?.intent ?? 0
    const commitment = hiddenTruth.requiredSignals?.commitment ?? 0
    const total = intent + commitment

    return {
      available: true,
      opener: `Although ${hiddenTruth.perceived.label} dominates your browsing,`,
      punch: `your strongest emotional responses consistently come from ${hiddenTruth.actual.label}.`,
      evidence: total > 0
        ? `This pattern appears across ${total} separate signals.`
        : null,
    }
  }

  const contradiction = contradictions?.[0]
  if (contradiction?.statement) {
    return {
      available: true,
      opener: contradiction.statement,
      punch: null,
      evidence: contradiction.strength
        ? `Backed by ${contradiction.strength} cross-signal evidence points.`
        : null,
    }
  }

  const top = emotionalResonance?.[0]
  if (top?.reaction && top?.topGenres?.[0]) {
    return {
      available: true,
      opener: `Your ${top.reaction} reactions keep clustering around ${top.topGenres[0]}.`,
      punch: top.evidenceCount
        ? `That reaction appears ${top.evidenceCount} time${top.evidenceCount === 1 ? '' : 's'} in your library.`
        : null,
      evidence: confidence?.signalCount
        ? `Drawn from ${confidence.signalCount} total aura signals.`
        : null,
    }
  }

  return { available: false }
}
