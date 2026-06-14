import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { Pencil, ThumbsUp, Trash2, User, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useUiStore from '../../store/uiStore'
import movieService from '../../services/movieService'
import StarRatingInput from './StarRatingInput'
import { formatDate } from '../../utils/formatters'
import { resolveAvatarUrl } from '../../utils/avatarUtils'
import './MovieReviewsSection.css'

const MAX_REVIEW_LENGTH = 2000

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'helpful', label: 'Most Helpful' },
]

const ReviewStars = ({ rating }) => (
  <div className="movie-review-card__stars" aria-label={`Rated ${rating} out of 5`}>
    {Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`movie-review-card__star ${index < rating ? 'movie-review-card__star--filled' : ''}`}
      >
        ★
      </span>
    ))}
  </div>
)

const ReviewSkeleton = () => (
  <div className="movie-review-skeleton" aria-hidden="true">
    <div className="movie-review-skeleton__head" />
    <div className="movie-review-skeleton__stars" />
    <div className="movie-review-skeleton__line" />
    <div className="movie-review-skeleton__line movie-review-skeleton__line--short" />
  </div>
)

const ReviewCard = ({
  review,
  onVote,
  onEdit,
  onDelete,
  isAuthenticated,
  currentUserId,
}) => {
  const [revealed, setRevealed] = useState(!review.containsSpoiler)
  const [menuOpen, setMenuOpen] = useState(false)
  const isOwner = currentUserId && String(review.userId) === String(currentUserId)
  const avatarSrc = resolveAvatarUrl(review.avatarImage)

  return (
    <article className="movie-review-card movie-review-card--premium">
      <div className="movie-review-card__header">
        <div className="movie-review-card__user">
          <div className="movie-review-card__avatar">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" />
            ) : (
              <User size={18} />
            )}
          </div>
          <div className="movie-review-card__user-info">
            <p className="movie-review-card__username">{review.username || 'CineAura Member'}</p>
            <div className="movie-review-card__user-badges">
              {review.profileTitle && (
                <span className="movie-review-card__title-badge">{review.profileTitle}</span>
              )}
              {isOwner && (
                <span className="movie-review-card__owner-badge">YOUR REVIEW</span>
              )}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="movie-review-card__menu-wrap">
            <button 
              type="button" 
              className="movie-review-card__menu-btn" 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Manage review"
            >
              ⋯
            </button>
            {menuOpen && (
              <div className="movie-review-card__dropdown" onMouseLeave={() => setMenuOpen(false)}>
                <button type="button" onClick={() => { setMenuOpen(false); onEdit(review) }}>
                  Edit Review
                </button>
                <button type="button" className="danger" onClick={() => { setMenuOpen(false); onDelete(review._id) }}>
                  Delete Review
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="movie-review-card__content">
        <ReviewStars rating={review.rating} />

        <div className="movie-review-card__body">
          {review.title && <h4 className="movie-review-card__review-title">{review.title}</h4>}

          {review.containsSpoiler && !revealed ? (
            <div className="movie-review-card__spoiler-gate">
              <span className="movie-review-card__spoiler-badge">Contains Spoilers</span>
              <button type="button" className="movie-review-card__spoiler-btn" onClick={() => setRevealed(true)}>
                Reveal Content
              </button>
            </div>
          ) : (
            <p className="movie-review-card__text">{review.reviewText}</p>
          )}
        </div>
      </div>

      <div className="movie-review-card__footer">
        <time className="movie-review-card__date">{formatDate(review.createdAt)}</time>
        <div className="movie-review-card__actions">
          <button
            type="button"
            className={`movie-review-card__action-btn ${review.userVote === 'helpful' ? 'active' : ''}`}
            onClick={() => onVote(review._id, 'helpful')}
            disabled={isOwner || !isAuthenticated}
          >
            👍 Helpful {review.helpfulCount > 0 ? `(${review.helpfulCount})` : ''}
          </button>
          <button type="button" className="movie-review-card__action-btn" disabled>
            💜 Agree
          </button>
          <button type="button" className="movie-review-card__action-btn" disabled>
            💬 Reply
          </button>
        </div>
      </div>
    </article>
  )
}

const MovieReviewsSection = ({ movieId, onReviewChange }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const openAuthModal = useUiStore((s) => s.openAuthModal)
  const user = useAuthStore((s) => s.user)
  const currentUserId = user?.id
  const composerAvatar = resolveAvatarUrl(user?.avatarImage)
  const composerTitle = useMemo(
    () => user?.currentTitle?.titleName || user?.currentTitle || null,
    [user?.currentTitle]
  )

  const [reviews, setReviews] = useState([])
  const [sort, setSort] = useState('newest')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const dropdownRef = useRef(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const [title, setTitle] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(0)
  const [containsSpoiler, setContainsSpoiler] = useState(false)

  const loadReviews = useCallback(async () => {
    if (!movieId) return
    setIsLoading(true)
    try {
      const res = await movieService.getReviews(movieId, { sort })
      const nextReviews = res.data?.payload || []
      setReviews(nextReviews)
      return nextReviews
    } catch {
      setReviews([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [movieId, sort])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const resetComposer = () => {
    setTitle('')
    setReviewText('')
    setRating(0)
    setContainsSpoiler(false)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please log in to write a review')
      return
    }
    if (!rating) {
      toast.error('Select a star rating')
      return
    }
    if (!reviewText || reviewText.trim().length < 5) {
      toast.error('Review must be at least 5 characters')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingId) {
        await movieService.updateReview(editingId, {
          rating,
          title: title.trim(),
          reviewText: reviewText.trim(),
          containsSpoiler,
        })
        toast.success('Review updated successfully')
      } else {
        await movieService.addReview({
          movieId,
          rating,
          title: title.trim(),
          reviewText: reviewText.trim(),
          containsSpoiler,
        })
        toast.success('Review published successfully')
      }

      resetComposer()
      await loadReviews()
      onReviewChange?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (review) => {
    setEditingId(review._id)
    setTitle(review.title || '')
    setReviewText(review.reviewText || '')
    setRating(review.rating || 0)
    setContainsSpoiler(!!review.containsSpoiler)
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return

    try {
      await movieService.deleteReview(reviewId)
      toast.success('Review deleted successfully')
      if (editingId === reviewId) resetComposer()
      await loadReviews()
      onReviewChange?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete review')
    }
  }

  const handleVote = async (reviewId, vote) => {
    if (!isAuthenticated) {
      openAuthModal()
      return
    }

    const current = reviews.find((r) => r._id === reviewId)
    if (currentUserId && current && String(current.userId) === String(currentUserId)) {
      toast.error('You cannot vote on your own review')
      return
    }

    try {
      const nextVote = current?.userVote === vote ? 'clear' : vote
      const res = await movieService.voteReview(reviewId, { vote: nextVote })
      const updated = res.data?.payload
      setReviews((prev) => prev.map((item) => (item._id === reviewId ? updated : item)))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not record vote')
    }
  }

  const handleComposerKeyDown = (e) => {
    if (e.key !== 'Enter') return
    if (!(e.ctrlKey || e.metaKey)) return
    e.preventDefault()
    handleSubmit(e)
  }

  return (
    <section className="movie-reviews-section" id="reviews" aria-label="Reviews">
      <div className="movie-reviews-section__header">
        <div>
          <h2 className="movie-reviews-section__title">Reviews</h2>
          <p className="movie-reviews-section__subtitle">Community reactions and personal opinions.</p>
        </div>
        <div className="movie-reviews-section__stats">
          {reviews.length > 0 && (
            <>
              <span className="movie-reviews-section__count-badge">{reviews.length} Reviews</span>
              {reviews.filter(r => r.rating > 0).length > 0 && (
                <span className="movie-reviews-section__avg-badge">
                  Average {(reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.filter(r => r.rating > 0).length).toFixed(1)}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="movie-reviews-section__toolbar">
        <div className="movie-reviews-sort-dropdown" ref={dropdownRef}>
          <button 
            type="button" 
            className="movie-reviews-sort-dropdown__trigger"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-label="Sort reviews"
          >
            {SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sort'}
            <ChevronDown size={16} />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.ul 
                className="movie-reviews-sort-dropdown__list"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                role="listbox"
              >
                {SORT_OPTIONS.map((option) => (
                  <li 
                    key={option.value}
                    role="option"
                    aria-selected={sort === option.value}
                    className={`movie-reviews-sort-dropdown__item ${sort === option.value ? 'selected' : ''}`}
                    onClick={() => {
                      setSort(option.value)
                      setIsDropdownOpen(false)
                    }}
                  >
                    {option.label}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isAuthenticated && (
        <form className="movie-reviews-composer movie-reviews-composer--premium" onSubmit={handleSubmit}>
          <div className="movie-reviews-composer__header">
            <h3>{editingId ? 'Edit Your Take' : 'Share Your Take'}</h3>
            <p>Tell the community what stayed with you after the credits rolled.</p>
          </div>

          <div className="movie-reviews-composer__identity">
            <div className="movie-reviews-composer__avatar">
              {composerAvatar ? (
                <img src={composerAvatar} alt="" />
              ) : (
                <User size={20} />
              )}
            </div>
            <div>
              <p className="movie-reviews-composer__username">{user?.username || 'CineAura Member'}</p>
              {composerTitle && (
                <span className="movie-reviews-composer__title-badge">{composerTitle}</span>
              )}
            </div>
          </div>

          <h4 className="movie-reviews-composer__prompt">"What did this movie make you feel?"</h4>

          <div className="movie-reviews-composer__rating-block">
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          <input
            type="text"
            className="movie-reviews-composer__input"
            placeholder="Review title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />

          <textarea
            className="movie-reviews-composer__textarea"
            placeholder="Share your personal take..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            onKeyDown={handleComposerKeyDown}
            rows={5}
            maxLength={MAX_REVIEW_LENGTH}
            required
          />

          <div className="movie-reviews-composer__meta-row">
            <label className="movie-reviews-composer__spoiler">
              <input
                type="checkbox"
                checked={containsSpoiler}
                onChange={(e) => setContainsSpoiler(e.target.checked)}
              />
              Contains spoilers
            </label>
            <span className="movie-reviews-composer__counter">
              {reviewText.length}/{MAX_REVIEW_LENGTH}
            </span>
          </div>

          <div className="movie-reviews-composer__actions">
            <p className="movie-reviews-composer__shortcut">Press Ctrl+Enter or Cmd+Enter to publish</p>
            <div className="movie-reviews-composer__btn-group">
              {editingId && (
                <button type="button" className="movie-reviews-composer__cancel" onClick={resetComposer}>
                  Cancel
                </button>
              )}
              <button type="submit" className="movie-reviews-composer__submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : editingId ? 'Update Review' : 'Publish Review'}
              </button>
            </div>
          </div>
        </form>
      )}

      {!isAuthenticated && (
        <div className="movie-reviews-guest-banner">
          <div className="movie-reviews-guest-banner__content">
            <h4>Want to share your opinion?</h4>
            <p>Create a CineAura account to write reviews, react to movies, and build your cinematic identity.</p>
          </div>
          <button type="button" className="movie-reviews-guest-banner__btn" onClick={openAuthModal}>
            Sign In
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="movie-reviews-section__skeletons">
          <ReviewSkeleton />
          <ReviewSkeleton />
        </div>
      ) : reviews.length === 0 ? (
        <div className="movie-reviews-empty movie-reviews-empty--premium">
          <h3>No reviews yet</h3>
          <p>Be the first person to share a reaction.<br/>Start the conversation.</p>
          <button 
            type="button" 
            className="movie-reviews-empty__btn" 
            onClick={() => isAuthenticated ? document.querySelector('.movie-reviews-composer')?.scrollIntoView({ behavior: 'smooth' }) : openAuthModal()}
          >
            Write First Review
          </button>
        </div>
      ) : (
        <div className="movie-reviews-section__list">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onVote={handleVote}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAuthenticated={isAuthenticated}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default MovieReviewsSection
