import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { buildReactionStats } from '../../utils/movieDetailsUtils'
import './MovieCommunityReactions.css'

const MovieCommunityReactions = memo(({
  selectedReaction,
  reactionCounts = {},
  onReact,
  disabled = false,
}) => {
  const { entries, total, dominantLabel } = useMemo(
    () => buildReactionStats(reactionCounts),
    [reactionCounts]
  )

  return (
    <section className="movie-community-reactions" aria-label="Community emotion">
      <div className="movie-community-reactions__header">
        <h2 className="md-section-title">Community Emotion</h2>
        {dominantLabel ? (
          <p className="movie-community-reactions__dominant">{dominantLabel}</p>
        ) : (
          <p className="movie-community-reactions__subtitle">
            No emotional signals yet.
          </p>
        )}
        {total > 0 && (
          <p className="movie-community-reactions__total">
            {total} reaction{total === 1 ? '' : 's'} from the CineAura community
          </p>
        )}
      </div>

      <div className="movie-community-reactions__panel">
        {entries.map((item, index) => {
          const isActive = selectedReaction === item.value
          const showPct = total > 0

          return (
            <motion.button
              key={item.value}
              type="button"
              className={`movie-community-reactions__item ${isActive ? 'movie-community-reactions__item--active' : ''}`}
              onClick={() => onReact(item.value)}
              disabled={disabled}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="movie-community-reactions__item-top">
                <span className="movie-community-reactions__emoji" aria-hidden="true">{item.emoji}</span>
                <span className="movie-community-reactions__label">{item.label}</span>
                {item.count > 0 && (
                  <span className="movie-community-reactions__count">{item.count}</span>
                )}
              </div>
              <div className="movie-community-reactions__track" aria-hidden="true">
                <motion.div
                  className="movie-community-reactions__fill"
                  initial={{ width: 0 }}
                  animate={{ width: showPct ? `${item.percent}%` : '0%' }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                />
              </div>
              {showPct && item.count > 0 && (
                <span className="movie-community-reactions__pct">{item.percent}%</span>
              )}
            </motion.button>
          )
        })}
      </div>
    </section>
  )
})

MovieCommunityReactions.displayName = 'MovieCommunityReactions'

export default MovieCommunityReactions
