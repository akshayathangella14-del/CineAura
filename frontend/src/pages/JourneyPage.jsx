import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Compass, Flag, Flame, Map, Milestone, Trophy, Video } from 'lucide-react'
import useRecommendationStore from '../store/recommendationStore'
import CineAuraLoader from '../components/common/CineAuraLoader'
import { getImageUrl } from '../utils/formatters'
import './JourneyPage.css'

const StatCard = ({ icon: Icon, value, label }) => (
  <div className="journey-page__stat">
    <Icon size={22} />
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
)

const MovieMoment = ({ label, movie }) => {
  if (!movie) return null

  return (
    <div className="journey-page__moment">
      <img src={getImageUrl(movie.poster || movie.posterOriginal || movie.posterPath, 'w342')} alt={movie.title} />
      <div>
        <span>{label}</span>
        <h2>{movie.title}</h2>
        {movie.releaseYear && <p>{movie.releaseYear}</p>}
      </div>
    </div>
  )
}

const JourneyPage = () => {
  const fetchJourney = useRecommendationStore((s) => s.fetchJourney)
  const journey = useRecommendationStore((s) => s.journey)
  const isLoading = useRecommendationStore((s) => s.isLoading)
  const [animatedTitle, setAnimatedTitle] = useState('')

  useEffect(() => {
    fetchJourney()
  }, [fetchJourney])

  useEffect(() => {
  const title = journey?.currentEra || 'Continue Your Journey'

  let index = 0

  setAnimatedTitle('')

  const interval = setInterval(() => {
    index++

    setAnimatedTitle(title.slice(0, index))

    if (index >= title.length) {
      clearInterval(interval)
    }
  }, 80)

  return () => clearInterval(interval)
}, [journey?.currentEra])

  if (isLoading || !journey) return <CineAuraLoader variant="page" />

  if (!journey.hasJourneyData) {
    return (
      <div id="page-journey" className="journey-page">
        <motion.section
          className="journey-page__hero"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>Your Cinematic Story</span>
          <h1>Begin Your Journey</h1>
          <p>Your cinematic timeline is empty. Start exploring movies to build your history.</p>
        </motion.section>
        <section className="journey-page__stats">
          <StatCard icon={Video} value={0} label="Movies Explored" />
          <StatCard icon={Map} value={0} label="Genres Explored" />
          <StatCard icon={Flame} value={0} label="Current Streak" />
          <StatCard icon={Trophy} value={0} label="Longest Streak" />
        </section>
      </div>
    )
  }

  return (
    <div id="page-journey" className="journey-page">
      <motion.section
        className="journey-page__hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span>Your Cinematic Story</span>

       <h1 className="journey-page__animated-title">
  {animatedTitle}
  <span className="journey-page__cursor">|</span>
</h1>

        <p>
          Your cinematic taste evolved from
          <strong> {journey.beginningEra || 'Movie Explorer'} </strong>
          to
          <strong> {journey.currentEra || 'Cinephile'}.</strong>
        </p>

      </motion.section>

      <section className="journey-page__stats">

        <StatCard
          icon={Map}
          value={journey.tasteEvolutionTimeline?.length || 0}
          label="Taste Chapters"
        />
        <StatCard
          icon={Flame}
          value={`${journey.currentStreak || 0} Days`}
          label="Current Streak"
        />
        <StatCard
          icon={Trophy}
          value={`${journey.longestStreak || 0} Days`}
          label="Best Streak"
        />
      </section>

      <section className="journey-page__moments">
        <MovieMoment
          label="Where It All Began"
          movie={journey.firstMovie}
        />

        <MovieMoment
          label="Most Recent Interaction"
          movie={journey.latestMovie}
        />
      </section>

      <section className="journey-page__profile">
        <div>
          <Flag size={22} />
          <span>Starting Identity</span>
          <strong>{journey.beginningEra}</strong>
        </div>
        <div>
          <Compass size={22} />
          <span>Current Identity</span>
          <strong>{journey.currentEra}</strong>
        </div>
        <div>
          <Milestone size={22} />
          <span>Exploration Style</span>

          <strong>
            {
              journey.explorationGrowth?.riskTakingScore >= 70
                ? "Bold Explorer"
                : journey.explorationGrowth?.riskTakingScore >= 40
                  ? "Curious Explorer"
                  : "Comfort Zone Viewer"
            }
          </strong>
        </div>
      </section>

      {(journey.tasteEvolutionTimeline || []).length > 0 && (
        <section className="journey-page__timeline">
          <h2>Your Cinematic Chapters</h2>
          <div className="journey-page__era-flow">
            {journey.tasteEvolutionTimeline.map((era, index) => (
              <div
                key={`${era.label}-${index}`}
                className="journey-page__chapter"
              >
                <div className="journey-page__chapter-number">
                  CHAPTER {String(index + 1).padStart(2, '0')}
                </div>

                <h3>{era.label}</h3>
                <p className="journey-page__chapter-summary">
                  {era.summary}
                </p>

                <div className="journey-page__chapter-meta">
                  <span>Dominant Genre</span>
                  <strong>{era.dominantGenre}</strong>
                </div>

                <div className="journey-page__chapter-meta">
                  <span>Started</span>
                  <strong>
                    {new Date(era.from).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {journey.totalMoviesWatched >= 5 && (
        <section className="journey-page__milestones">
          <h2>Watch Milestones</h2>
          <div className="journey-page__milestone-list">
            {(journey.watchMilestones || journey.milestones || []).map((milestone) => (
              <div
                key={milestone.target}
                className={`journey-page__milestone ${milestone.achieved ? 'journey-page__milestone--achieved' : ''}`}
              >
                <Trophy size={20} />
                <strong>{milestone.title}</strong>
                <span>{milestone.achieved ? 'Unlocked' : `${milestone.progress}%`}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default JourneyPage
