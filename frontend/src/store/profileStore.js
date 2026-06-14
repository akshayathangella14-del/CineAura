// CineAura Profile Store
// Manages: avatars, watchlist, reviews, feedback, user insights
import { create } from 'zustand'

const useProfileStore = create((set) => ({
  // State
  avatars: [],
  watchlist: [],
  reviews: [],
  feedbackHistory: [],
  similarUsers: [],
  tasteTimeline: [],
  isLoading: false,
  error: null,

  // Actions
  setAvatars: (avatars) =>
    set({ avatars }),

  setWatchlist: (watchlist) =>
    set({ watchlist }),

  addToWatchlist: (movie) =>
    set((state) => ({
      watchlist: [...state.watchlist, movie],
    })),

  removeFromWatchlist: (movieId) =>
    set((state) => ({
      watchlist: state.watchlist.filter((item) => item._id !== movieId),
    })),

  setReviews: (reviews) =>
    set({ reviews }),

  addReview: (review) =>
    set((state) => ({
      reviews: [review, ...state.reviews],
    })),

  updateReview: (reviewId, updatedReview) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r._id === reviewId ? { ...r, ...updatedReview } : r
      ),
    })),

  removeReview: (reviewId) =>
    set((state) => ({
      reviews: state.reviews.filter((r) => r._id !== reviewId),
    })),

  setFeedbackHistory: (feedbackHistory) =>
    set({ feedbackHistory }),

  setSimilarUsers: (similarUsers) =>
    set({ similarUsers }),

  setTasteTimeline: (tasteTimeline) =>
    set({ tasteTimeline }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setError: (error) =>
    set({ error, isLoading: false }),
}))

export default useProfileStore
