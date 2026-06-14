import { useState } from 'react'
import toast from 'react-hot-toast'
import IdentityIcon from './IdentityIcon'
import identityService from '../../services/identityService'
import { getRarityClassName, getUnlockConditionLabel } from '../../utils/identityDisplayUtils'
import './ProfileCollections.css'

const ProfileBadgesCollection = ({ badges = [], onUpdated }) => {
  const [busyId, setBusyId] = useState(null)

  const handleEquip = async (badgeId) => {
    setBusyId(badgeId)
    try {
      await identityService.equipBadge(badgeId)
      toast.success('Badge equipped')
      await onUpdated?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not equip badge')
    } finally {
      setBusyId(null)
    }
  }

  const handleUnequip = async () => {
    setBusyId('unequip')
    try {
      await identityService.unequipBadge()
      toast.success('Badge unequipped')
      await onUpdated?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not unequip badge')
    } finally {
      setBusyId(null)
    }
  }

  if (!badges.length) {
    return <p className="profile-collection__empty">No badges available yet.</p>
  }

  const equippedBadge = badges.find((badge) => badge.isEquipped)

  return (
    <div className="profile-badges-collection">
      {equippedBadge && (
        <div className="profile-collection__actions">
          <button
            type="button"
            className="profile-collection__btn profile-collection__btn--ghost"
            onClick={handleUnequip}
            disabled={busyId === 'unequip'}
          >
            {busyId === 'unequip' ? 'Removing…' : 'Unequip Badge'}
          </button>
        </div>
      )}

      <div className="profile-badges-collection__grid">
        {badges.map((badge) => {
          const isLocked = !badge.isUnlocked
          const unlockLabel = getUnlockConditionLabel(badge.unlockCondition)
          const rarityClass = getRarityClassName(badge.rarity)

          return (
            <article
              key={badge.badgeId}
              className={`profile-identity-card profile-identity-card--badge ${rarityClass} ${
                badge.isEquipped ? 'profile-identity-card--equipped' : ''
              } ${isLocked ? 'profile-identity-card--locked' : ''}`}
            >
              <div className="profile-identity-card__icon-wrap profile-identity-card__icon-wrap--badge">
                <IdentityIcon iconKey={badge.icon} size={26} />
              </div>
              <h3 className="profile-identity-card__name">{badge.badgeName}</h3>
              {badge.rarity && (
                <span className={`profile-identity-card__rarity ${rarityClass}`}>
                  {badge.rarity}
                </span>
              )}
              <p className="profile-identity-card__desc">{badge.description}</p>

              {isLocked && unlockLabel && (
                <p className="profile-identity-card__unlock">{unlockLabel}</p>
              )}

              {badge.isEquipped && (
                <span className="profile-identity-card__status">Equipped</span>
              )}

              {badge.isUnlocked && !badge.isEquipped && (
                <button
                  type="button"
                  className="profile-collection__btn profile-collection__btn--primary"
                  onClick={() => handleEquip(badge.badgeId)}
                  disabled={busyId === badge.badgeId}
                >
                  {busyId === badge.badgeId ? 'Equipping…' : 'Equip'}
                </button>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default ProfileBadgesCollection
