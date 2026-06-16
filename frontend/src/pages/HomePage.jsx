import { useEffect, Fragment, useMemo } from 'react'
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

// ── Helper: check if a movie has a usable backdrop ──
const hasBackdrop = (m) => !!(m?.backdrop || m?.backdropPath || m?.backdropOriginal)
const getMovieId = (m) => m?._id || m?.tmdbId

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

  // ── Derive 5-8 hero candidates from already-fetched data ──
  // Logged-in: prioritize personalized sections (aura, because-watched)
  // Guest: use public sections with daily shuffle for variety
  const heroMovies = useMemo(() => {
    const candidates = []
    const seenIds = new Set()

    const addCandidate = (movie) => {
      if (!movie || !hasBackdrop(movie)) return false
      const id = getMovieId(movie)
      if (!id || seenIds.has(id)) return false
      seenIds.add(id)
      candidates.push(movie)
      return true
    }

    // 1. Lead with the dedicated hero movie
    if (heroMovie) addCandidate(heroMovie)

    // 2. Build section priority based on authentication
    const personalizedKeys = ['aura', 'because-watched', 'continue-journey', 'new-discoveries']
    const publicKeys = ['trending', 'crowd-favorites', 'critics-obsessions', 'top-rated', 'hidden-gems', 'recently-released']
    const priorityKeys = isAuthenticated
      ? [...personalizedKeys, ...publicKeys]
      : publicKeys

    const orderedSections = []
    if (homeSections?.length) {
      for (const key of priorityKeys) {
        const section = homeSections.find(s => s.key === key)
        if (section?.movies?.length) orderedSections.push(section)
      }
      // Include any remaining sections not in priority list
      for (const section of homeSections) {
        if (section?.movies?.length && !priorityKeys.includes(section.key)) {
          orderedSections.push(section)
        }
      }
    }

    // 3. Collect eligible movies from sections
    const pool = []
    for (const section of orderedSections) {
      for (const movie of section.movies) {
        if (!movie || !hasBackdrop(movie)) continue
        const id = getMovieId(movie)
        if (!id || seenIds.has(String(id))) continue
        pool.push(movie)
      }
    }

    // 4. For guests, shuffle pool with a daily seed for variety
    //    For logged-in users, personalized sections already provide variety
    if (!isAuthenticated && pool.length > 1) {
      const daySeed = new Date().toISOString().slice(0, 10)
      let hash = 0
      for (let i = 0; i < daySeed.length; i++) {
        hash = ((hash << 5) - hash + daySeed.charCodeAt(i)) | 0
      }
      // Fisher-Yates with deterministic seed
      for (let i = pool.length - 1; i > 0; i--) {
        hash = (hash * 1103515245 + 12345) & 0x7fffffff
        const j = hash % (i + 1)
        ;[pool[i], pool[j]] = [pool[j], pool[i]]
      }
    }

    // 5. Fill remaining hero slots from pool
    for (const movie of pool) {
      if (candidates.length >= 7) break
      addCandidate(movie)
    }

    return candidates.length > 0 ? candidates : heroMovie ? [heroMovie] : []
  }, [heroMovie, homeSections, isAuthenticated])

  return (
    <div className="home-page" id="page-home">
      {/* ── Hero Section ──────────────────── */}
      <motion.div
        custom={0}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <HeroSection movie={heroMovies} isLoading={isMovieLoading} />
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
