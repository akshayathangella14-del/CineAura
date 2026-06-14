import api from './api'

const auraService = {
  getAuraProfile: () => api.get('/aura/profile'),
}

export default auraService
