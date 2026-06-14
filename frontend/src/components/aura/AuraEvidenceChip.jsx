import { getImageUrl } from '../../utils/formatters'

const AuraEvidenceChip = ({ movie, label }) => {
  if (!movie && !label) return null

  const title = movie?.title || label
  const poster = getImageUrl(
    movie?.poster || movie?.posterOriginal || movie?.posterPath,
    'w154'
  )

  return (
    <div className="aura-evidence-chip">
      {poster ? (
        <img src={poster} alt={title} className="aura-evidence-chip__poster" />
      ) : (
        <div className="aura-evidence-chip__placeholder" />
      )}
      <span className="aura-evidence-chip__title">{title}</span>
    </div>
  )
}

export default AuraEvidenceChip
