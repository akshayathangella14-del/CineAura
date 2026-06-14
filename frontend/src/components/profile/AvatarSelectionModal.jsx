import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Lock, User, X } from 'lucide-react'
import toast from 'react-hot-toast'
import identityService from '../../services/identityService'
import { resolveAvatarUrl } from '../../utils/avatarUtils'
import { getUnlockConditionLabel } from '../../utils/identityDisplayUtils'
import './AvatarSelectionModal.css'

const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

const AvatarSelectionModal = ({
  isOpen,
  onClose,
  currentAvatarId,
  initialSelectedId,
  avatars: avatarsProp = [],
  isCatalogLoading = false,
  onSaved,
}) => {
  const [avatars, setAvatars] = useState(avatarsProp)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedId, setSelectedId] = useState(currentAvatarId || '')
  const panelRef = useRef(null)
  const closeBtnRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const nextSelected = initialSelectedId || currentAvatarId || ''
    setSelectedId(nextSelected)

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, currentAvatarId, initialSelectedId, onClose])

  useEffect(() => {
    if (!isOpen) return
    setAvatars(avatarsProp)
  }, [isOpen, avatarsProp])

  useEffect(() => {
    if (!isOpen || avatarsProp.length > 0) return

    setIsLoading(true)
    identityService.getAvatars()
      .then((res) => setAvatars(res.data?.payload || []))
      .catch(() => {
        toast.error('Could not load avatars')
        setAvatars([])
      })
      .finally(() => setIsLoading(false))
  }, [isOpen, avatarsProp.length])

  useEffect(() => {
    if (!isOpen) return
    closeBtnRef.current?.focus()
  }, [isOpen, isLoading, isCatalogLoading])

  const handleFocusTrap = useCallback((e) => {
    if (e.key !== 'Tab' || !panelRef.current) return

    const focusable = Array.from(panelRef.current.querySelectorAll(FOCUSABLE))
    if (!focusable.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  const handleSelect = (avatar) => {
    if (!avatar.isUnlocked) return
    setSelectedId(avatar.avatarId)
  }

  const handleSave = async () => {
    if (!selectedId) {
      toast.error('Select an avatar first')
      return
    }

    const selected = avatars.find((avatar) => avatar.avatarId === selectedId)

    if (selected && !selected.isUnlocked) {
      toast.error('This avatar is locked')
      return
    }

    setIsSaving(true)
    try {
      const res = await identityService.updateAvatar({ avatarId: selectedId })
      onSaved(res.data?.payload)
      toast.success('Avatar updated')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save avatar')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedAvatar = avatars.find((a) => a.avatarId === selectedId)
  const previewSrc = resolveAvatarUrl(selectedAvatar?.avatarImage)
  const loading = isCatalogLoading || isLoading

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="avatar-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
      >
        <motion.div
          ref={panelRef}
          className="avatar-modal__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="avatar-modal-title"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleFocusTrap}
        >
          <button
            ref={closeBtnRef}
            type="button"
            className="avatar-modal__close"
            onClick={onClose}
            aria-label="Close avatar picker"
          >
            <X size={20} />
          </button>

          <header className="avatar-modal__header">
            <h2 id="avatar-modal-title">Choose Your Avatar</h2>
            <p>Select from your unlocked avatars. Locked avatars show how to earn them.</p>
          </header>

          <div className="avatar-modal__preview">
            <div className={`avatar-modal__preview-ring ${selectedAvatar && !selectedAvatar.isUnlocked ? 'avatar-modal__preview-ring--locked' : ''}`}>
              {previewSrc ? (
                <img src={previewSrc} alt={selectedAvatar?.avatarName || 'Selected avatar'} />
              ) : (
                <div className="avatar-modal__preview-fallback">
                  <User size={40} />
                </div>
              )}
            </div>
            <div>
              <span className="avatar-modal__preview-label">Preview</span>
              <strong>{selectedAvatar?.avatarName || 'No avatar selected'}</strong>
              {selectedAvatar?.isEquipped && (
                <span className="avatar-modal__preview-equipped">Currently equipped</span>
              )}
              {selectedAvatar && !selectedAvatar.isUnlocked && (
                <span className="avatar-modal__preview-locked">
                  {getUnlockConditionLabel(selectedAvatar.unlockCondition) || 'Locked'}
                </span>
              )}
            </div>
          </div>

          <div className="avatar-modal__grid-wrap">
            {loading ? (
              <p className="avatar-modal__status">Loading avatars…</p>
            ) : avatars.length === 0 ? (
              <p className="avatar-modal__status">No avatars available yet.</p>
            ) : (
              <div className="avatar-modal__grid" role="listbox" aria-label="Avatar options">
                {avatars.map((avatar) => {
                  const isSelected = avatar.avatarId === selectedId
                  const isLocked = !avatar.isUnlocked
                  const src = resolveAvatarUrl(avatar.avatarImage)
                  const unlockLabel = getUnlockConditionLabel(avatar.unlockCondition)

                  return (
                    <button
                      key={avatar.avatarId}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={isLocked}
                      disabled={isLocked}
                      className={`avatar-modal__option ${isSelected ? 'avatar-modal__option--active' : ''} ${isLocked ? 'avatar-modal__option--locked' : ''} ${avatar.isEquipped ? 'avatar-modal__option--equipped' : ''}`}
                      onClick={() => handleSelect(avatar)}
                    >
                      <span className="avatar-modal__option-ring">
                        {src ? (
                          <img src={src} alt="" />
                        ) : (
                          <User size={28} />
                        )}
                        {isLocked && (
                          <span className="avatar-modal__lock" aria-hidden="true">
                            <Lock size={14} />
                          </span>
                        )}
                        {isSelected && !isLocked && (
                          <span className="avatar-modal__check" aria-hidden="true">
                            <Check size={14} />
                          </span>
                        )}
                      </span>
                      <span className="avatar-modal__option-name">{avatar.avatarName}</span>
                      {isLocked && unlockLabel && (
                        <span className="avatar-modal__option-unlock">{unlockLabel}</span>
                      )}
                      {avatar.isEquipped && !isLocked && (
                        <span className="avatar-modal__option-equipped">Equipped</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <footer className="avatar-modal__footer">
            <button type="button" className="avatar-modal__btn avatar-modal__btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="avatar-modal__btn avatar-modal__btn--primary"
              onClick={handleSave}
              disabled={isSaving || !selectedId || (selectedAvatar && !selectedAvatar.isUnlocked)}
            >
              {isSaving ? 'Saving…' : 'Save Avatar'}
            </button>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

export default AvatarSelectionModal
