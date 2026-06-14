import { Sparkles } from 'lucide-react'
import './WhyAuraUsersLike.css'

const PLACEHOLDER_INSIGHTS = [
  'Popular among Drama Responders',
  'Popular among Action Responders',
  'Resonates with Emotional reaction profiles',
]

const WhyAuraUsersLike = ({ genres = [] }) => {
  const genreHints = genres.slice(0, 2).map((genre) => `Popular among ${genre} Responders`)
  const insights = genreHints.length ? genreHints : PLACEHOLDER_INSIGHTS

  return (
    <section className="why-aura-users">
      <div className="why-aura-users__header">
        <Sparkles size={18} />
        <h3>Why Aura Users Like This</h3>
      </div>
      <p className="why-aura-users__note">Placeholder insights until the recommendation engine fully supports audience matching.</p>
      <div className="why-aura-users__chips">
        {insights.map((insight) => (
          <span key={insight} className="why-aura-users__chip">{insight}</span>
        ))}
      </div>
    </section>
  )
}

export default WhyAuraUsersLike
