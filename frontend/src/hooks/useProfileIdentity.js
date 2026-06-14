import { useCallback, useEffect, useState } from 'react'
import identityService from '../services/identityService'

const extractPayload = (res) => res?.data?.payload ?? null

export const useProfileIdentity = () => {
  const [profile, setProfile] = useState(null)
  const [titles, setTitles] = useState([])
  const [badges, setBadges] = useState([])
  const [achievements, setAchievements] = useState([])
  const [avatars, setAvatars] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadIdentity = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    try {
      const [profileRes, titlesRes, badgesRes, achievementsRes, avatarsRes] = await Promise.all([
        identityService.getProfile(),
        identityService.getTitles(),
        identityService.getBadges(),
        identityService.getAchievements(),
        identityService.getAvatars(),
      ])

      setProfile(extractPayload(profileRes))
      setTitles(extractPayload(titlesRes) || [])
      setBadges(extractPayload(badgesRes) || [])
      setAchievements(extractPayload(achievementsRes) || [])
      setAvatars(extractPayload(avatarsRes) || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your profile identity')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const res = await identityService.getProfile()
      setProfile(extractPayload(res))
      return extractPayload(res)
    } catch {
      return null
    }
  }, [])

  const refreshTitles = useCallback(async () => {
    const res = await identityService.getTitles()
    const payload = extractPayload(res) || []
    setTitles(payload)
    return payload
  }, [])

  const refreshBadges = useCallback(async () => {
    const res = await identityService.getBadges()
    const payload = extractPayload(res) || []
    setBadges(payload)
    return payload
  }, [])

  const refreshAvatars = useCallback(async () => {
    const res = await identityService.getAvatars()
    const payload = extractPayload(res) || []
    setAvatars(payload)
    return payload
  }, [])

  useEffect(() => {
    loadIdentity()
  }, [loadIdentity])

  return {
    profile,
    setProfile,
    titles,
    badges,
    achievements,
    avatars,
    isLoading,
    error,
    loadIdentity,
    refreshProfile,
    refreshTitles,
    refreshBadges,
    refreshAvatars,
  }
}

export default useProfileIdentity
