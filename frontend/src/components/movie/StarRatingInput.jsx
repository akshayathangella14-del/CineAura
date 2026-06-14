import { useState } from 'react'
import { Star } from 'lucide-react'
import './StarRatingInput.css'

const LABELS = ['Poor', 'Fair', 'Good', 'Great', 'Outstanding']

const StarRatingInput = ({ value, onChange, max = 5, size = 36 }) => {
  const [hoverValue, setHoverValue] = useState(0)

  return (
    <div className="star-rating-input-container">
      <div 
        className="star-rating-input" 
        role="radiogroup" 
        aria-label="Rating"
        onMouseLeave={() => setHoverValue(0)}
      >
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1
          const isActive = starValue <= (hoverValue || value)

          return (
            <button
              key={starValue}
              type="button"
              className={`star-rating-input__star ${isActive ? 'star-rating-input__star--active' : ''}`}
              onClick={() => onChange(starValue)}
              onMouseEnter={() => setHoverValue(starValue)}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
              aria-checked={isActive}
              role="radio"
            >
              <Star
                size={size}
                fill={isActive ? '#fbbf24' : 'transparent'}
                color={isActive ? '#fbbf24' : 'rgba(148, 163, 184, 0.3)'}
                strokeWidth={1.5}
              />
            </button>
          )
        })}
      </div>
      <span className="star-rating-input__label">
        {(hoverValue || value) > 0 ? LABELS[(hoverValue || value) - 1] : 'Rate this film'}
      </span>
    </div>
  )
}

export default StarRatingInput
