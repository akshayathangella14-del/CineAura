import { motion } from 'framer-motion'
import { REACTION_CONFIG } from '../../utils/movieReactions'
import './MovieReactionLayer.css'

const MovieReactionLayer = ({ selectedReaction, reactionCounts, onReact, disabled = false }) => {
  return (
    <section className="movie-reaction-layer" aria-label="How did this movie make you feel?">
      <div className="movie-reaction-layer__inner">
        <h2 className="movie-reaction-layer__title">How did this movie make you feel?</h2>
        <p className="movie-reaction-layer__subtitle">Tap a reaction to add your emotional signal to the community.</p>

        <div className="movie-reaction-layer__grid">
          {REACTION_CONFIG.map((item, index) => {
            const isActive = selectedReaction === item.value
            const count = reactionCounts[item.value] || 0

            return (
              <motion.button
                key={item.value}
                type="button"
                className={`movie-reaction-layer__card ${isActive ? 'movie-reaction-layer__card--active' : ''}`}
                onClick={() => onReact(item.value)}
                disabled={disabled}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="movie-reaction-layer__emoji" aria-hidden="true">{item.emoji}</span>
                <span className="movie-reaction-layer__label">{item.label}</span>
                <span className="movie-reaction-layer__count">{count}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default MovieReactionLayer
