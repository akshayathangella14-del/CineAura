// CineAura Admin Service
// Endpoints from: AdminAPI.js
import api from './api'

const adminService = {
  // GET /admin/dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // GET /admin/users
  getUsers: (params = {}) => api.get('/admin/users', { params }),

  // GET /admin/movies
  getMovies: (params = {}) => api.get('/admin/movies', { params }),

  // GET /admin/reviews
  getReviews: (params = {}) => api.get('/admin/reviews', { params }),

  // PATCH /admin/users/:userId/status
  updateUserStatus: (userId, data) => api.patch(`/admin/users/${userId}/status`, data),

  // DELETE /admin/reviews/:reviewId
  deleteReview: (reviewId) => api.delete(`/admin/reviews/${reviewId}`),

  // POST /admin/movies/sync
  syncMovies: (data) => api.post('/admin/movies/sync', data),
}

export default adminService
