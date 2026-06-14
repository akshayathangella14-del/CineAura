import { REACTION_CONFIG } from '../../utils/movieReactions'
import './CommunitySentiment.css'

const CommunitySentiment = ({ reactionCounts = {} }) => {
  const entries = REACTION_CONFIG.map((item) => ({
    ...item,
    count: reactionCounts[item.value] || 0,
  }))

  const total = entries.reduce((sum, item) => sum + item.count, 0)

  if (total === 0) {
    return (
      <section className="community-sentiment">
        <h3 className="community-sentiment__title">Community Reaction</h3>
        <p className="community-sentiment__empty">Be the first to share how this movie made you feel.</p>
      </section>
    )
  }

  return (
    <section className="community-sentiment">
      <h3 className="community-sentiment__title">Community Reaction</h3>
      <div className="community-sentiment__bars">
        {entries
          .filter((item) => item.count > 0)
          .sort((a, b) => b.count - a.count)
          .map((item) => {
            const pct = Math.round((item.count / total) * 100)
            return (
              <div key={item.value} className="community-sentiment__row">
                <div className="community-sentiment__label">
                  <span>{item.emoji} {item.label}</span>
                  <strong>{pct}%</strong>
                </div>
                <div className="community-sentiment__track">
                  <div
                    className="community-sentiment__fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
      </div>
    </section>
  )
}

export default CommunitySentiment
