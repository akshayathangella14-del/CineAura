// CineAura Profile Service
// Endpoints from: UserInsightAPI.js
import api from './api'

const profileService = {
  // GET /api/users/:id/similar-users
  getSimilarUsers: (userId) => api.get(`/api/users/${userId}/similar-users`),

  // GET /api/users/:id/taste-timeline
  getTasteTimeline: (userId) => api.get(`/api/users/${userId}/taste-timeline`),
}

export default profileService
