import { Orbit } from 'lucide-react'
import AuraSectionReveal from './AuraSectionReveal'

const formatTheme = (theme) =>
  String(theme)
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim()

const ThematicGravity = ({ thematicGravity = [] }) => {
  if (!thematicGravity.length) return null

  return (
    <AuraSectionReveal className="aura-card">
      <div className="aura-card__header">
        <Orbit size={22} />
        <span className="aura-card__label">Thematic Gravity</span>
      </div>
      <p className="aura-card__lead">Recurring story currents across the films you commit to.</p>

      <div className="aura-theme-orbs">
        {thematicGravity.map((item, index) => (
          <div
            key={item.theme}
            className="aura-theme-orb"
            style={{ '--orb-delay': `${index * 0.08}s` }}
          >
            <span className="aura-theme-orb__name">{formatTheme(item.theme)}</span>
            <span className="aura-theme-orb__count">{item.evidenceCount} signals</span>
          </div>
        ))}
      </div>
    </AuraSectionReveal>
  )
}

export default ThematicGravity
