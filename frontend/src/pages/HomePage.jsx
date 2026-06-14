import { useEffect, Fragment } from 'react'
import { motion } from 'framer-motion'
import { Compass, Gem, Heart, Search, Sparkles, Trophy, Wand2, Flame, Film, Clock } from 'lucide-react'

// Components
import HeroSection from '../components/movie/HeroSection'
import MovieRow from '../components/movie/MovieRow'
import SectionHeader from '../components/common/SectionHeader'
import AuthPromoCard from '../components/auth/AuthPromoCard'

// Stores
import useMovieStore from '../store/movieStore'
import useRecommendationStore from '../store/recommendationStore'
import useAuthStore from '../store/authStore'

// Styles
import './HomePage.css'

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: (i) => ({
    opacity: 1,
    transition: { delay: i * 0.12, duration: 0.5 },
  }),
}

const sectionIcons = {
  trending: Flame,
  aura: Sparkles,
  'continue-journey': Compass,
  'because-watched': Clock,
  'crowd-favorites': Heart,
  'critics-obsessions': Trophy,
  'hidden-gems': Gem,
  'new-discoveries': Wand2,
  'recently-released': Search,
  'top-rated': Film,
}

const sectionLinks = {
  trending: "/movies/trending",
  "crowd-favorites": "/movies/popular",
  "critics-obsessions": "/movies/top-rated",
  "top-rated": "/movies/top-rated",
}

const HomePage = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  
  // Movie store for Hero
  const heroMovie = useMovieStore((s) => s.heroMovie)
  const isMovieLoading = useMovieStore((s) => s.isLoading)
  const fetchHeroMovie = useMovieStore((s) => s.fetchHeroMovie)

  // Recommendation store for dynamic sections
  const homeSections = useRecommendationStore((s) => s.homeSections)
  const fetchHomeSections = useRecommendationStore((s) => s.fetchHomeSections)
  const isRecLoading = useRecommendationStore((s) => s.isLoading)

  // Fetch all homepage data on mount
  useEffect(() => {
    fetchHeroMovie()
    fetchHomeSections()
  }, [fetchHeroMovie, fetchHomeSections, isAuthenticated])

  return (
    <div className="home-page" id="page-home">
      {/* ── Hero Section ──────────────────── */}
      <motion.div
        custom={0}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <HeroSection movie={heroMovie} isLoading={isMovieLoading} />
      </motion.div>

      {/* ── Dynamic Recommendation Sections ── */}
      {homeSections?.map((section, index) => (
        <Fragment key={section.title || index}>
          <motion.section
            className={`home-page__section ${index === homeSections.length - 1 ? 'home-page__section--last' : ''}`}
            custom={index + 1}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <SectionHeader
              title={section.title}
              icon={sectionIcons[section.key] || Film}
              linkTo={sectionLinks[section.key]}
            />
            <MovieRow
              movies={section.movies}
              isLoading={isRecLoading}
              skeletonCount={6}
              rowId={`home-section-${index}`}
            />
          </motion.section>

          {!isAuthenticated && index === 0 && (
            <motion.div
              custom={index + 1.5}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              <AuthPromoCard />
            </motion.div>
          )}
        </Fragment>
      ))}

      {/* Fallback if no sections load yet */}
      {isRecLoading && (!homeSections || homeSections.length === 0) && (
        <motion.section
          className="home-page__section"
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <SectionHeader title="Loading Recommendations..." />
          <MovieRow isLoading={true} skeletonCount={6} />
        </motion.section>
      )}
    </div>
  )
}

export default HomePage
