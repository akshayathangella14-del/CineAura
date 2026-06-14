// CineAura Loading Skeleton
// Shimmer placeholders for content loading states
import './LoadingSkeleton.css'

const LoadingSkeleton = ({ variant = 'card', count = 1, className = '' }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i)

  if (variant === 'hero') {
    return (
      <div className={`skeleton skeleton--hero ${className}`} id="skeleton-hero">
        <div className="skeleton__shimmer" />
        <div className="skeleton--hero__content">
          <div className="skeleton__bar skeleton__bar--lg" style={{ width: '35%' }} />
          <div className="skeleton__bar skeleton__bar--sm" style={{ width: '50%' }} />
          <div className="skeleton__bar skeleton__bar--sm" style={{ width: '40%' }} />
          <div className="skeleton--hero__actions">
            <div className="skeleton__pill" style={{ width: '120px' }} />
            <div className="skeleton__pill" style={{ width: '100px' }} />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={`skeleton-row ${className}`}>
        {skeletons.map((i) => (
          <div key={i} className="skeleton skeleton--card">
            <div className="skeleton__shimmer" />
            <div className="skeleton--card__poster" />
            <div className="skeleton--card__info">
              <div className="skeleton__bar skeleton__bar--md" style={{ width: '80%' }} />
              <div className="skeleton__bar skeleton__bar--sm" style={{ width: '50%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'text') {
    return (
      <div className={`skeleton-text ${className}`}>
        {skeletons.map((i) => (
          <div key={i} className="skeleton__bar skeleton__bar--sm" style={{ width: `${60 + (i % 4) * 8}%` }} />
        ))}
      </div>
    )
  }

  return null
}

export default LoadingSkeleton
