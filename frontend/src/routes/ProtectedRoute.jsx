import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { ROUTES, USER_ROLES } from '../utils/constants'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }

  if (adminOnly && user?.role !== USER_ROLES.ADMIN) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return children
}

export default ProtectedRoute
