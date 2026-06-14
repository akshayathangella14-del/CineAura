// CineAura Profile Identity Service
// Endpoints from: ProfileIdentityAPI.js, UserAPI.js, AvatarAPI.js
import api from './api'

const identityService = {
  getProfile: () => api.get('/profile'),

  getTitles: () => api.get('/profile/identity/titles'),

  equipTitle: (titleId) => api.put('/profile/identity/titles/equip', { titleId }),

  unequipTitle: () => api.put('/profile/identity/titles/unequip'),

  getBadges: () => api.get('/profile/identity/badges'),

  equipBadge: (badgeId) => api.put('/profile/identity/badges/equip', { badgeId }),

  unequipBadge: () => api.put('/profile/identity/badges/unequip'),

  getAchievements: () => api.get('/profile/identity/achievements'),

  getAvatars: () => api.get('/profile/identity/avatars'),

  updateAvatar: (data) => api.put('/profile/avatar', data),
}

export default identityService
