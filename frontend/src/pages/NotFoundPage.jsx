// CineAura — Not Found Page (Placeholder)
import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div id="page-not-found">
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/">Go Home</Link>
    </div>
  )
}

export default NotFoundPage
