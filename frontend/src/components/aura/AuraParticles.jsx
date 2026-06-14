const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${8 + (i * 5.2) % 84}%`,
  top: `${12 + (i * 7.3) % 76}%`,
  size: 2 + (i % 3),
  delay: `${(i % 6) * 0.7}s`,
  duration: `${6 + (i % 4) * 1.5}s`,
}))

const AuraParticles = ({ disabled = false }) => {
  if (disabled) return null

  return (
    <div className="aura-particles" aria-hidden="true">
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="aura-particles__dot"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  )
}

export default AuraParticles
