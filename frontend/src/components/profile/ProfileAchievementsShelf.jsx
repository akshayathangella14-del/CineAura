import IdentityIcon from './IdentityIcon'
import { formatEarnedDate } from '../../utils/identityDisplayUtils'
import { formatDate } from '../../utils/formatters'
import './ProfileCollections.css'

const ProfileAchievementsShelf = ({ achievements = [] }) => {
  if (!achievements.length) {
    return <p className="profile-collection__empty">No achievements available yet.</p>
  }

  return (
    <div className="profile-achievements-shelf">
      {achievements.map((achievement) => {
        const isEarned = Boolean(achievement.isEarned)
        const earnedLabel = formatEarnedDate(achievement.earnedAt, formatDate)

        return (
          <article
            key={achievement.achievementId}
            className={`profile-identity-card profile-identity-card--achievement ${
              isEarned ? 'profile-identity-card--earned' : 'profile-identity-card--locked'
            }`}
          >
            <div className="profile-identity-card__icon-wrap">
              <IdentityIcon
                iconKey={achievement.icon}
                category={achievement.category}
                size={24}
              />
            </div>
            <h3 className="profile-identity-card__name">{achievement.title}</h3>
            <p className="profile-identity-card__desc">{achievement.description}</p>

            {isEarned && earnedLabel && (
              <p className="profile-identity-card__earned">Earned {earnedLabel}</p>
            )}

            {!isEarned && (
              <span className="profile-identity-card__status profile-identity-card__status--locked">
                Locked
              </span>
            )}
          </article>
        )
      })}
    </div>
  )
}

export default ProfileAchievementsShelf
