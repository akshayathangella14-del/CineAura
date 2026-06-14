import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import './MovieTrailerModal.css'

const MovieTrailerModal = ({ isOpen, onClose, title, trailerEmbedUrl }) => {
  useEffect(() => {
    if (!isOpen) return undefined

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !trailerEmbedUrl) return null

  return createPortal(
    <motion.div
      className="movie-trailer-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="movie-trailer-modal__panel"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title ? `${title} trailer` : 'Movie trailer'}
      >
        <button type="button" className="movie-trailer-modal__close" onClick={onClose} aria-label="Close trailer">
          <X size={20} />
        </button>
        <div className="movie-trailer-modal__frame-wrap">
          <iframe
            src={trailerEmbedUrl}
            title={`${title || 'Movie'} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}

export default MovieTrailerModal
