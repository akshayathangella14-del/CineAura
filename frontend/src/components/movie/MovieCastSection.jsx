import CastHoverCard from './CastHoverCard'
import PersonCard from './PersonCard'
import './MovieCastSection.css'

const MovieCastSection = ({ cast = [], directors = [], writers = [], crew = [] }) => {
  const hasCast = cast.length > 0
  const hasCrew = directors.length > 0 || writers.length > 0 || crew.length > 0

  if (!hasCast && !hasCrew) return null

  return (
    <section className="movie-cast-section movie-cast-section--cinematic" aria-label="Cast and crew">
      <h2 className="md-section-title">Cast &amp; Crew</h2>

      {directors.length > 0 && (
        <div className="movie-cast-section__group">
          <h3 className="movie-cast-section__label">Director</h3>
          <div className="movie-cast-section__crew-row">
            {directors.map((name) => (
              <PersonCard key={`dir-${name}`} name={name} role="Director" />
            ))}
          </div>
        </div>
      )}

      {writers.length > 0 && (
        <div className="movie-cast-section__group">
          <h3 className="movie-cast-section__label">Writer</h3>
          <div className="movie-cast-section__crew-row">
            {writers.map((name) => (
              <PersonCard key={`wri-${name}`} name={name} role="Writer" />
            ))}
          </div>
        </div>
      )}

      {crew.length > 0 && (
        <div className="movie-cast-section__group">
          <h3 className="movie-cast-section__label">Crew</h3>
          <div className="movie-cast-section__crew-row movie-cast-section__crew-row--text">
            {crew.map((name) => (
              <span key={`crew-${name}`} className="movie-cast-section__crew-chip">{name}</span>
            ))}
          </div>
        </div>
      )}

      {hasCast && (
        <div className="movie-cast-section__group">
          <h3 className="movie-cast-section__label">Top Cast</h3>
          <div className="movie-cast-section__cast-scroll">
            {cast.slice(0, 12).map((actor, index) => (
              <CastHoverCard key={`${actor.name}-${index}`} actor={actor} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default MovieCastSection
