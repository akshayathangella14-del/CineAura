import './MovieDetailsSkeleton.css'

const Shimmer = ({ className = '' }) => (
  <div className={`md-shimmer ${className}`.trim()} aria-hidden="true" />
)

const MovieDetailsSkeleton = () => (
  <div className="movie-details-skeleton" aria-busy="true" aria-label="Loading movie details">
    <section className="md-skeleton-hero">
      <Shimmer className="md-skeleton-hero__backdrop" />
      <div className="md-skeleton-hero__content">
        <Shimmer className="md-skeleton-hero__crumb" />
        <div className="md-skeleton-hero__grid">
          <Shimmer className="md-skeleton-hero__poster" />
          <div className="md-skeleton-hero__main">
            <Shimmer className="md-skeleton-hero__title" />
            <Shimmer className="md-skeleton-hero__meta" />
            <Shimmer className="md-skeleton-hero__overview" />
            <Shimmer className="md-skeleton-hero__overview md-skeleton-hero__overview--short" />
          </div>
          <Shimmer className="md-skeleton-hero__ratings" />
        </div>
      </div>
    </section>

    <div className="md-skeleton-body">
      <Shimmer className="md-skeleton-block md-skeleton-block--wide" />
      <div className="md-skeleton-reviews">
        <Shimmer className="md-skeleton-block" />
        <Shimmer className="md-skeleton-review-card" />
        <Shimmer className="md-skeleton-review-card" />
      </div>
      <div className="md-skeleton-cast">
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} className="md-skeleton-cast-card" />
        ))}
      </div>
      <div className="md-skeleton-similar">
        {Array.from({ length: 5 }).map((_, i) => (
          <Shimmer key={i} className="md-skeleton-similar-card" />
        ))}
      </div>
    </div>
  </div>
)

export default MovieDetailsSkeleton
