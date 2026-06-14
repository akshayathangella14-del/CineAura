// CineAura Auth Store
// Manages: authentication, user profile, session persistence
import { create } from 'zustand'
import authService from '../services/authService'
import { setItem, getItem, removeItem, clearAll } from '../utils/storage'
import { STORAGE_KEYS } from '../utils/constants'

// Normalize User
const normalizeUser = (payload = {}, token = null) => ({
  ...payload,
  id: payload.id || payload._id || null,
  name: payload.name || payload.username || 'User',
  username: payload.username || payload.name || 'User',
  token,
})

const useAuthStore = create((set) => ({
  // State
  user: getItem(STORAGE_KEYS.USER, null),
  isAuthenticated: !!getItem(STORAGE_KEYS.USER, null),
  isLoading: false,
  error: null,

  // ─── Sync Actions ────────────────────────────────────
  setUser: (user) => {
    if (user) {
      setItem(STORAGE_KEYS.USER, user)
    } else {
      removeItem(STORAGE_KEYS.USER)
    }
    set({ user, isAuthenticated: !!user, error: null })
  },

  setLoading: (isLoading) =>
    set({ isLoading }),

  setError: (error) =>
    set({ error, isLoading: false }),

  clearError: () =>
    set({ error: null }),

  // ─── Async Actions ───────────────────────────────────

  // Register new user
  register: async ({ name, email, password }) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authService.register({ name, email, password })
      // Registration successful — user still needs to log in
      set({ isLoading: false })
      return { success: true, message: res.data.message }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      set({ error: message, isLoading: false })
      return { success: false, message }
    }
  },

  // Login with email + password
  login: async ({ email, password }) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authService.login({ email, password })
      const { payload, token } = res.data
      const user = normalizeUser(payload, token)
      setItem(STORAGE_KEYS.USER, user)
      set({ user, isAuthenticated: true, isLoading: false, error: null })
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      set({ error: message, isLoading: false })
      return { success: false, message }
    }
  },

  // Logout
  logoutUser: async () => {
    try {
      await authService.logout()
    } catch {
      // Logout API may fail if token expired — still clear local state
    }
    clearAll()
    set({ user: null, isAuthenticated: false, error: null })
  },

  // Restore session
  restoreSession: async () => {
    const savedUser = getItem(STORAGE_KEYS.USER, null)
    try {
      const res = await authService.getProfile()
      const freshUser = normalizeUser(res.data.payload, savedUser?.token || null)
      setItem(STORAGE_KEYS.USER, freshUser)
      set({ user: freshUser, isAuthenticated: true })
    } catch {
      // Token expired or invalid — clear session
      clearAll()
      set({ user: null, isAuthenticated: false })
    }
  },

  // Merge account profile updates (avatar, name, etc.)
  applyProfileUpdate: (profilePayload = {}) => {
    const savedUser = getItem(STORAGE_KEYS.USER, {})
    const user = normalizeUser(
      { ...savedUser, ...profilePayload },
      savedUser?.token || null
    )
    setItem(STORAGE_KEYS.USER, user)
    set({ user, isAuthenticated: true })
  },

  // Fetch profile (manual refresh)
  fetchProfile: async () => {
    set({ isLoading: true })
    try {
      const res = await authService.getProfile()
      const savedUser = getItem(STORAGE_KEYS.USER, {})
      const user = normalizeUser(res.data.payload, savedUser?.token || null)
      setItem(STORAGE_KEYS.USER, user)
      set({ user, isAuthenticated: true, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },
}))

export default useAuthStore
