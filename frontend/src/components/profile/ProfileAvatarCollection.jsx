import { Lock, User } from 'lucide-react'
import { resolveAvatarUrl } from '../../utils/avatarUtils'
import { getUnlockConditionLabel } from '../../utils/identityDisplayUtils'
import './ProfileCollections.css'

const ProfileAvatarCollection = ({ avatars = [], onAvatarClick }) => {
  const unlocked = avatars.filter((avatar) => avatar.isUnlocked)
  const locked = avatars.filter((avatar) => !avatar.isUnlocked)

  if (!avatars.length) {
    return <p className="profile-collection__empty">No avatars available yet.</p>
  }

  const renderAvatar = (avatar, isLocked) => {
    const src = resolveAvatarUrl(avatar.avatarImage)
    const unlockLabel = getUnlockConditionLabel(avatar.unlockCondition)

    return (
      <button
        key={avatar.avatarId}
        type="button"
        className={`profile-avatar-card ${isLocked ? 'profile-avatar-card--locked' : ''} ${avatar.isEquipped ? 'profile-avatar-card--equipped' : ''}`}
        onClick={() => !isLocked && onAvatarClick?.(avatar.avatarId)}
        disabled={isLocked}
        aria-label={isLocked ? `${avatar.avatarName} — locked` : `Select ${avatar.avatarName}`}
      >
        <span className="profile-avatar-card__ring">
          {src ? (
            <img src={src} alt="" className="profile-avatar-card__img" />
          ) : (
            <span className="profile-avatar-card__fallback">
              <User size={28} />
            </span>
          )}
          {isLocked && (
            <span className="profile-avatar-card__lock" aria-hidden="true">
              <Lock size={18} />
            </span>
          )}
        </span>
        <span className="profile-avatar-card__name">{avatar.avatarName}</span>
        {isLocked && unlockLabel && (
          <span className="profile-avatar-card__unlock">{unlockLabel}</span>
        )}
        {!isLocked && avatar.isEquipped && (
          <span className="profile-avatar-card__equipped">Equipped</span>
        )}
      </button>
    )
  }

  return (
    <div className="profile-avatar-collection">
      {unlocked.length > 0 && (
        <div className="profile-collection__group">
          <h3 className="profile-collection__subtitle">Unlocked</h3>
          <div className="profile-avatar-collection__grid">
            {unlocked.map((avatar) => renderAvatar(avatar, false))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div className="profile-collection__group">
          <h3 className="profile-collection__subtitle">Locked</h3>
          <div className="profile-avatar-collection__grid">
            {locked.map((avatar) => renderAvatar(avatar, true))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileAvatarCollection
