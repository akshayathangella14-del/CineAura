// CineAura Auth Service
// Endpoints from: UserAPI.js, AvatarAPI.js
import api from './api'

const authService = {
  // POST /register
  register: (data) => api.post('/register', data),

  // POST /login
  login: (data) => api.post('/login', data),

  // POST /logout
  logout: () => api.post('/logout'),

  // GET /profile
  getProfile: () => api.get('/profile'),

  // PUT /profile
  updateProfile: (data) => api.put('/profile', data),

  // GET /avatars
  getAvatars: () => api.get('/avatars'),

  // PUT /profile/avatar
  updateAvatar: (data) => api.put('/profile/avatar', data),
}

export default authService
