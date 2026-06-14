import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { ROUTES } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'
import './ProfileCollections.css'

const ProfileAccountPreferences = ({ profile }) => {
  const logoutUser = useAuthStore((s) => s.logoutUser)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutUser()
    navigate(ROUTES.HOME)
  }

  if (!profile) return null

  const joinedDate = profile.createdAt
    ? formatDate(profile.createdAt, { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="profile-account">
      <dl className="profile-account__list">
        <div className="profile-account__row">
          <dt>Email</dt>
          <dd>{profile.email}</dd>
        </div>
        <div className="profile-account__row">
          <dt>Role</dt>
          <dd>{profile.role}</dd>
        </div>
        {joinedDate && (
          <div className="profile-account__row">
            <dt>Joined</dt>
            <dd>{joinedDate}</dd>
          </div>
        )}
      </dl>

      <button
        type="button"
        className="profile-account__logout"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  )
}

export default ProfileAccountPreferences
