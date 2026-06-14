// CineAura Route Configuration
// Central route architecture — all routes defined here
// Uses layout wrappers: MainLayout (app pages) and AuthLayout (login/register)
import { Routes, Route } from 'react-router-dom'

// Layouts
import MainLayout from '../components/layout/MainLayout'
import AuthLayout from '../components/layout/AuthLayout'
import ProtectedRoute from './ProtectedRoute'

// Pages
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import SearchPage from '../pages/SearchPage'
import MovieDetailsPage from '../pages/MovieDetailsPage'
import ActorDetailsPage from '../pages/ActorDetailsPage'
import SeeAllPage from '../pages/SeeAllPage'
import ProfilePage from '../pages/ProfilePage'
import AuraPage from '../pages/AuraPage'
import JourneyPage from '../pages/JourneyPage'
import WatchlistPage from '../pages/WatchlistPage'
import AdminDashboardPage from '../pages/AdminDashboardPage'
import NotFoundPage from '../pages/NotFoundPage'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes — wrapped in AuthLayout (split cinematic + glass panel) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* App routes — wrapped in MainLayout (navbar + sidebar + content) */}
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movies/trending" element={<SeeAllPage category="trending" />} />
        <Route path="/movies/popular" element={<SeeAllPage category="popular" />} />
        <Route path="/movies/top-rated" element={<SeeAllPage category="top-rated" />} />
        <Route path="/movies/upcoming" element={<SeeAllPage category="upcoming" />} />
        <Route path="/movies/:movieId" element={<MovieDetailsPage />} />
        <Route path="/actors/:actorId" element={<ActorDetailsPage />} />

        {/* Protected */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/aura" element={<ProtectedRoute><AuraPage /></ProtectedRoute>} />
        <Route path="/journey" element={<ProtectedRoute><JourneyPage /></ProtectedRoute>} />
        <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
