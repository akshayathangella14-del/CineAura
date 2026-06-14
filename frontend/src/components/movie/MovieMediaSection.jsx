import { getImageUrl } from '../../utils/formatters'
import './MovieMediaSection.css'

const normalizeMediaPath = (value) => {
  if (!value) return null
  if (typeof value === 'string') return value
  return value.path || value.file_path || null
}

const MovieMediaSection = ({ title, trailerEmbedUrl, backdrop, poster }) => {
  const backdropSrc = backdrop ? getImageUrl(backdrop, 'original') : null
  const posterSrc = poster ? getImageUrl(poster, 'original') : null

  const backdropPath = normalizeMediaPath(backdrop)
  const posterPath = normalizeMediaPath(poster)
  const hasDistinctBackdrop = backdropSrc && backdropPath && posterPath && backdropPath !== posterPath

  const galleryImages = [
    hasDistinctBackdrop && { src: backdropSrc, alt: `${title} backdrop`, label: 'Backdrop' },
  ].filter(Boolean)

  if (!trailerEmbedUrl && !posterSrc && galleryImages.length === 0) return null

  return (
    <section className="movie-media-section movie-media-section--premium" id="media" aria-label="Media">
      <h2 className="md-section-title">Trailer &amp; Media</h2>

      {trailerEmbedUrl && (
        <div className="movie-media-section__trailer" id="trailer">
          <div className="movie-media-section__trailer-frame">
            <iframe
              src={trailerEmbedUrl}
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {posterSrc && (
        <figure className="movie-media-section__poster-block">
          <img src={posterSrc} alt={`${title} poster`} />
        </figure>
      )}

      {galleryImages.length > 0 && (
        <div className="movie-media-section__gallery">
          <h3 className="movie-media-section__label">Gallery</h3>
          <div className="movie-media-section__gallery-grid">
            {galleryImages.map((image) => (
              <figure key={image.label} className="movie-media-section__still">
                <img src={image.src} alt={image.alt} />
                <figcaption>{image.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default MovieMediaSection
