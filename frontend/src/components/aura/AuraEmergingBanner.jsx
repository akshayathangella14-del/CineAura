import { Compass } from 'lucide-react'

const AuraEmergingBanner = ({ confidence }) => (
  <div className="aura-emerging-banner">
    <Compass size={20} />
    <div>
      <strong>Emerging Aura</strong>
      <p>
        Your cinematic fingerprint is developing.
        {confidence?.signalCount != null && (
          <> {confidence.signalCount} signals recorded — keep reacting and exploring to crystallize your profile.</>
        )}
      </p>
    </div>
  </div>
)

export default AuraEmergingBanner
