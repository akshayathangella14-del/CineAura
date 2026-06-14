import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import './TrailerModal.css'

const buildAutoplayUrl = (embedUrl) => {
  if (!embedUrl) return ''
  const separator = embedUrl.includes('?') ? '&' : '?'
  return `${embedUrl}${separator}autoplay=1&mute=0`
}

const TrailerModal = ({ isOpen, onClose, title, trailerEmbedUrl }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return undefined

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="trailer-modal"
          role="dialog"
          aria-modal="true"
          aria-label={title ? `${title} trailer` : 'Movie trailer'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            className="trailer-modal__backdrop"
            onClick={onClose}
            aria-label="Close trailer"
          />

          <motion.div
            className="trailer-modal__panel"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <button type="button" className="trailer-modal__close" onClick={onClose} aria-label="Close">
              <X size={22} />
            </button>

            {trailerEmbedUrl ? (
              <div className="trailer-modal__frame">
                <iframe
                  src={buildAutoplayUrl(trailerEmbedUrl)}
                  title={title ? `${title} Trailer` : 'Movie Trailer'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="trailer-modal__unavailable">
                <p>Trailer currently unavailable</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default TrailerModal
