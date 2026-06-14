import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import movieService from '../../services/movieService'
import { getPersonImage } from '../../utils/formatters'
import './CastHoverCard.css'

const CastHoverCard = ({ actor }) => {
  const [knownFor, setKnownFor] = useState([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate()

  // Resolve actor ID robustly (supporting raw id, tmdbId, populated actor objects, or ObjectID strings)
  const getInitialId = () => {
    let id = actor.id || actor.tmdbId
    if (!id && actor.actor) {
      if (typeof actor.actor === 'object') {
        id = actor.actor.id || actor.actor.tmdbId || actor.actor._id
      } else {
        id = actor.actor
      }
    }
    return id
  }

  const [resolvedActorId, setResolvedActorId] = useState(getInitialId)

  // Fallback: If DB record is missing the ID, fetch it dynamically by name (just like PersonCard)
  useEffect(() => {
    if (!resolvedActorId && actor.name) {
      let isMounted = true
      const recoverMissingId = async () => {
        try {
          const res = await movieService.searchActors({ q: actor.name })
          if (isMounted && res.data?.payload?.length > 0) {
            const found = res.data.payload[0]
            setResolvedActorId(found.tmdbId || found.id || found._id)
          }
        } catch (err) {
          console.warn('CastHoverCard: Failed to recover missing ID for', actor.name)
        }
      }
      recoverMissingId()
      return () => { isMounted = false }
    }
  }, [resolvedActorId, actor.name])

  // Print debugging log to track payload in client devtools
  useEffect(() => {
    console.log("CastHoverCard Render:", {
      actorName: actor.name,
      originalTmdbIdProp: actor.tmdbId || actor.id,
      resolvedActorId: resolvedActorId
    })
  }, [actor.name, actor.tmdbId, actor.id, resolvedActorId])

  const actorImg = getPersonImage(actor, 'w185')

  const handleEnter = async () => {
    if (!resolvedActorId || loaded || loading) return
    setLoading(true)
    try {
      const res = await movieService.getActor(resolvedActorId)
      const payload = res.data?.payload
      const movies = (payload?.knownFor || []).slice(0, 3).map((m) => m.title).filter(Boolean)
      setKnownFor(movies)
    } catch {
      setKnownFor([])
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }

  const renderContent = () => (
    <>
      <div className="cast-hover-card__avatar">
        {actorImg ? (
          <img src={actorImg} alt={actor.name} className="cast-hover-card__image" draggable="false" />
        ) : (
          <div className="cast-hover-card__fallback">
            <User size={32} opacity={0.3} />
          </div>
        )}
      </div>
      <div className="cast-hover-card__info">
        <span className="cast-hover-card__name">{actor.name}</span>
        <span className="cast-hover-card__role">{actor.character || 'Cast'}</span>
      </div>
    </>
  )

  return (
    <div className="cast-hover-card" onMouseEnter={handleEnter}>
      {resolvedActorId ? (
        <div 
          role="button"
          tabIndex={0}
          className="cast-hover-card__link"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log("CastHoverCard Programmatic Navigation to:", `/actors/${resolvedActorId}`)
            navigate(`/actors/${resolvedActorId}`)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              navigate(`/actors/${resolvedActorId}`)
            }
          }}
        >
          {renderContent()}
        </div>
      ) : (
        <div 
          className="cast-hover-card__link cast-hover-card__link--disabled"
          onClick={() => {
            console.warn("CastHoverCard CLICKED, but actorId is MISSING. Navigation disabled.")
          }}
        >
          {renderContent()}
        </div>
      )}

      <div className="cast-hover-card__popover">
        <p className="cast-hover-card__popover-title">{actor.name}</p>
        <p className="cast-hover-card__popover-known">
          Known for: <span>{actor.character || 'Featured role'}</span>
        </p>
        <div className="cast-hover-card__top-movies">
          <span className="cast-hover-card__top-label">Top Movies</span>
          {loading && <span className="cast-hover-card__top-loading">Loading…</span>}
          {!loading && knownFor.length === 0 && (
            <span className="cast-hover-card__top-loading">Explore filmography on profile</span>
          )}
          {!loading && knownFor.map((title) => (
            <span key={title} className="cast-hover-card__movie-chip">{title}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CastHoverCard
