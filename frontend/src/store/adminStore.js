// CineAura Admin Store
// Manages: admin dashboard, user management, movie management, review moderation
import { create } from 'zustand'

const useAdminStore = create((set) => ({
  // State
  dashboard: {
    totalUsers: 0,
    totalMovies: 0,
    totalReviews: 0,
    totalWatchlists: 0,
  },
  users: [],
  movies: [],
  reviews: [],
  isLoading: false,
  error: null,

  // Actions
  setDashboard: (dashboard) =>
    set({ dashboard }),

  setUsers: (users) =>
    set({ users }),

  updateUserStatus: (userId, status) =>
    set((state) => ({
      users: state.users.map((u) =>
        u._id === userId ? { ...u, status } : u
      ),
    })),

  setMovies: (movies) =>
    set({ movies }),

  setReviews: (reviews) =>
    set({ reviews }),

  removeReview: (reviewId) =>
    set((state) => ({
      reviews: state.reviews.filter((r) => r._id !== reviewId),
    })),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setError: (error) =>
    set({ error, isLoading: false }),
}))

export default useAdminStore
