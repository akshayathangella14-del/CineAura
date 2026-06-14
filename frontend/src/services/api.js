// CineAura API Instance
// Axios configuration with cookie auth and interceptors
import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for httpOnly cookie auth
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
// The backend primarily uses httpOnly cookies (set automatically).
// Authorization header fallback is supported for REST Client testing.
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const status = error.response?.status

    // Handle 401 Unauthorized — token expired or missing
    if (status === 401) {
      // Clear any local auth state if needed
      // Redirect will be handled by the auth store or route guards
      console.warn('CineAura API: Unauthorized — session may have expired')
    }

    // Handle 403 Forbidden — blocked user or insufficient role
    if (status === 403) {
      console.warn('CineAura API: Forbidden — access denied')
    }

    // Handle 404 Not Found
    if (status === 404) {
      console.warn('CineAura API: Resource not found')
    }

    // Handle 500 Server Error
    if (status === 500) {
      console.error('CineAura API: Server error')
    }

    return Promise.reject(error)
  }
)

export default api
