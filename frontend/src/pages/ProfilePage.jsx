import { useCallback, useState } from 'react'
import { Camera, User } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useProfileIdentity from '../hooks/useProfileIdentity'
import AvatarSelectionModal from '../components/profile/AvatarSelectionModal'
import ProfileAvatarCollection from '../components/profile/ProfileAvatarCollection'
import ProfileTitlesCollection from '../components/profile/ProfileTitlesCollection'
import ProfileBadgesCollection from '../components/profile/ProfileBadgesCollection'
import ProfileAchievementsShelf from '../components/profile/ProfileAchievementsShelf'
import ProfileAccountPreferences from '../components/profile/ProfileAccountPreferences'
import IdentityIcon from '../components/profile/IdentityIcon'
import CineAuraLoader from '../components/common/CineAuraLoader'
import { resolveAvatarUrl } from '../utils/avatarUtils'
import { formatDate } from '../utils/formatters'
import './ProfilePage.css'
import '../components/profile/ProfileCollections.css'

const ProfileSection = ({ eyebrow, title, description, children }) => (
  <section className="profile-section">
    <header className="profile-section__header">
      {eyebrow && <p className="profile-section__eyebrow">{eyebrow}</p>}
      <h2 className="profile-section__title">{title}</h2>
      {description && <p className="profile-section__desc">{description}</p>}
    </header>
    {children}
  </section>
)

const ProfilePage = () => {
  const {
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
  } = useProfileIdentity()

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [modalAvatarId, setModalAvatarId] = useState(null)
  const applyProfileUpdate = useAuthStore((s) => s.applyProfileUpdate)

  const openAvatarModal = useCallback((avatarId = null) => {
    setModalAvatarId(avatarId)
    setIsAvatarModalOpen(true)
  }, [])

  const handleAvatarSaved = useCallback(async (updatedProfile) => {
    if (!updatedProfile) return
    setProfile((prev) => ({ ...prev, ...updatedProfile }))
    applyProfileUpdate(updatedProfile)
    await refreshAvatars()
  }, [applyProfileUpdate, refreshAvatars, setProfile])

  const handleTitleBadgeUpdated = useCallback(async () => {
    const freshProfile = await refreshProfile()
    if (freshProfile) {
      setProfile(freshProfile)
      applyProfileUpdate(freshProfile)
    }
    await Promise.all([refreshTitles(), refreshBadges()])
  }, [applyProfileUpdate, refreshBadges, refreshProfile, refreshTitles, setProfile])

  if (isLoading) return <CineAuraLoader variant="page" />

  if (error || !profile) {
    return (
      <div id="page-profile" className="profile-page">
        <div className="profile-page__error">
          <p>{error || 'Could not load your profile.'}</p>
          <button type="button" className="profile-page__retry" onClick={loadIdentity}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  const avatarSrc = resolveAvatarUrl(profile.avatarImage)
  const memberSince = profile.createdAt
    ? formatDate(profile.createdAt, { month: 'long', year: 'numeric' })
    : null

  return (
    <div id="page-profile" className="profile-page">
      <section className="profile-hero" aria-label="Your CineAura identity">
        <button
          type="button"
          className="profile-hero__avatar-btn"
          onClick={() => openAvatarModal(profile.avatarId)}
          aria-label="Change your avatar"
        >
          <div className="profile-hero__avatar-ring">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="profile-hero__avatar-img" />
            ) : (
              <div className="profile-hero__avatar-fallback">
                <User size={56} strokeWidth={1.5} />
              </div>
            )}
          </div>
          <span className="profile-hero__avatar-edit">
            <Camera size={16} />
            Change Avatar
          </span>
        </button>

        <div className="profile-hero__identity">
          <p className="profile-hero__eyebrow">CineAura Identity</p>
          <h1 className="profile-hero__name">{profile.name}</h1>

          {profile.currentTitle && (
            <p className="profile-hero__title">
              <IdentityIcon iconKey={profile.currentTitle.icon} size={18} />
              <span>{profile.currentTitle.titleName}</span>
            </p>
          )}

          {profile.equippedBadge && (
            <p className={`profile-hero__badge identity-rarity--${profile.equippedBadge.rarity || 'common'}`}>
              <IdentityIcon iconKey={profile.equippedBadge.icon} size={18} />
              <span>{profile.equippedBadge.badgeName}</span>
            </p>
          )}

          <p className="profile-hero__email">{profile.email}</p>

          {memberSince && (
            <p className="profile-hero__member-since">Member since {memberSince}</p>
          )}
        </div>
      </section>

      <ProfileSection
        eyebrow="Collection"
        title="Avatars"
        description={`${profile.unlockedAvatarCount ?? 0} unlocked`}
      >
        <ProfileAvatarCollection
          avatars={avatars}
          onAvatarClick={(avatarId) => openAvatarModal(avatarId)}
        />
      </ProfileSection>

      <ProfileSection
        eyebrow="Identity"
        title="Titles"
        description={`${profile.unlockedTitleCount ?? 0} unlocked`}
      >
        <ProfileTitlesCollection titles={titles} onUpdated={handleTitleBadgeUpdated} />
      </ProfileSection>

      <ProfileSection
        eyebrow="Trophy Case"
        title="Badges"
        description={`${profile.unlockedBadgeCount ?? 0} unlocked`}
      >
        <ProfileBadgesCollection badges={badges} onUpdated={handleTitleBadgeUpdated} />
      </ProfileSection>

      <ProfileSection
        eyebrow="Shelf"
        title="Achievements"
        description="Your earned milestones"
      >
        <ProfileAchievementsShelf achievements={achievements} />
      </ProfileSection>

      <ProfileSection eyebrow="Account" title="Preferences">
        <ProfileAccountPreferences profile={profile} />
      </ProfileSection>

      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={() => {
          setIsAvatarModalOpen(false)
          setModalAvatarId(null)
        }}
        currentAvatarId={profile.avatarId}
        initialSelectedId={modalAvatarId}
        avatars={avatars}
        isCatalogLoading={isLoading}
        onSaved={handleAvatarSaved}
      />
    </div>
  )
}

export default ProfilePage
