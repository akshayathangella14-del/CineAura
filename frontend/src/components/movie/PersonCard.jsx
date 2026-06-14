import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User } from 'lucide-react'
import movieService from '../../services/movieService'
import { getPersonImage } from '../../utils/formatters'
import './PersonCard.css'

const PersonCard = ({ name, role = 'Director' }) => {
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchPerson = async () => {
      try {
        const res = await movieService.searchActors({ q: name })
        if (isMounted && res.data?.payload?.length > 0) {
          setPerson(res.data.payload[0])
        }
      } catch (err) {
        console.warn('Failed to fetch person data:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    if (name) fetchPerson()
    return () => {
      isMounted = false
    }
  }, [name])

  const personId = person ? (person.tmdbId || person._id) : null
  const imageUrl = getPersonImage(person, 'w185')

  if (!personId) {
    return (
      <div className="person-card person-card--disabled">
        <div className="person-card__avatar">
          <div className="person-card__fallback">
            <User size={32} opacity={0.3} />
          </div>
        </div>
        <div className="person-card__info">
          <span className="person-card__name">{name}</span>
          <span className="person-card__role">{role}</span>
        </div>
      </div>
    )
  }

  return (
    <Link to={`/actors/${personId}`} className="person-card">
      <div className="person-card__avatar">
        {imageUrl && !loading ? (
          <img src={imageUrl} alt={name} className="person-card__image" />
        ) : (
          <div className="person-card__fallback">
            <User size={32} opacity={0.3} />
          </div>
        )}
      </div>
      <div className="person-card__info">
        <span className="person-card__name">{name}</span>
        <span className="person-card__role">{role}</span>
      </div>
    </Link>
  )
}

export default PersonCard

