import { useState } from 'react'
import toast from 'react-hot-toast'
import IdentityIcon from './IdentityIcon'
import identityService from '../../services/identityService'
import { getUnlockConditionLabel } from '../../utils/identityDisplayUtils'
import './ProfileCollections.css'

const ProfileTitlesCollection = ({ titles = [], onUpdated }) => {
  const [busyId, setBusyId] = useState(null)

  const handleEquip = async (titleId) => {
    setBusyId(titleId)
    try {
      await identityService.equipTitle(titleId)
      toast.success('Title equipped')
      await onUpdated?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not equip title')
    } finally {
      setBusyId(null)
    }
  }

  const handleUnequip = async () => {
    setBusyId('unequip')
    try {
      await identityService.unequipTitle()
      toast.success('Title unequipped')
      await onUpdated?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not unequip title')
    } finally {
      setBusyId(null)
    }
  }

  if (!titles.length) {
    return <p className="profile-collection__empty">No titles available yet.</p>
  }

  const equippedTitle = titles.find((title) => title.isEquipped)

  return (
    <div className="profile-titles-collection">
      {equippedTitle && (
        <div className="profile-collection__actions">
          <button
            type="button"
            className="profile-collection__btn profile-collection__btn--ghost"
            onClick={handleUnequip}
            disabled={busyId === 'unequip'}
          >
            {busyId === 'unequip' ? 'Removing…' : 'Unequip Title'}
          </button>
        </div>
      )}

      <div className="profile-titles-collection__grid">
        {titles.map((title) => {
          const isLocked = !title.isUnlocked
          const unlockLabel = getUnlockConditionLabel(title.unlockCondition)

          return (
            <article
              key={title.titleId}
              className={`profile-identity-card profile-identity-card--title ${
                title.isEquipped ? 'profile-identity-card--equipped' : ''
              } ${isLocked ? 'profile-identity-card--locked' : ''}`}
            >
              <div className="profile-identity-card__icon-wrap">
                <IdentityIcon iconKey={title.icon} size={24} />
              </div>
              <h3 className="profile-identity-card__name">{title.titleName}</h3>
              <p className="profile-identity-card__desc">{title.description}</p>

              {isLocked && unlockLabel && (
                <p className="profile-identity-card__unlock">{unlockLabel}</p>
              )}

              {title.isEquipped && (
                <span className="profile-identity-card__status">Equipped</span>
              )}

              {title.isUnlocked && !title.isEquipped && (
                <button
                  type="button"
                  className="profile-collection__btn profile-collection__btn--primary"
                  onClick={() => handleEquip(title.titleId)}
                  disabled={busyId === title.titleId}
                >
                  {busyId === title.titleId ? 'Equipping…' : 'Equip'}
                </button>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default ProfileTitlesCollection
