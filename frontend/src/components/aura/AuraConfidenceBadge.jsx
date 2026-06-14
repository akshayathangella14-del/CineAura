const TIER_STYLES = {
  locked: 'aura-badge--locked',
  emerging: 'aura-badge--emerging',
  crystallized: 'aura-badge--crystallized',
}

const AuraConfidenceBadge = ({ confidence, auraState }) => {
  const state = auraState || confidence?.auraState || 'locked'
  const tier = confidence?.tier || 'Aura Locked'
  const signalCount = confidence?.signalCount ?? 0

  return (
    <div className={`aura-badge ${TIER_STYLES[state] || ''}`}>
      <span className="aura-badge__tier">{tier}</span>
      {signalCount > 0 && (
        <span className="aura-badge__signals">{signalCount} signals</span>
      )}
    </div>
  )
}

export default AuraConfidenceBadge
