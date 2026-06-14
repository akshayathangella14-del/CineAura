import {
  Award,
  Bookmark,
  Film,
  Heart,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  Trophy,
  User,
} from 'lucide-react'
import { getIdentityIconFamily } from '../../utils/identityDisplayUtils'

const CATEGORY_ICONS = {
  reviews: MessageSquare,
  reactions: Heart,
  watchlist: Bookmark,
  account: User,
  collection: Film,
  community: Star,
}

const FAMILY_ICONS = {
  title: Award,
  badge: Shield,
  achievement: Trophy,
  default: Sparkles,
}

const IdentityIcon = ({ iconKey, category, size = 22, className = '' }) => {
  const family = getIdentityIconFamily(iconKey)
  const IconComponent = family === 'achievement' && category
    ? (CATEGORY_ICONS[category] || FAMILY_ICONS.achievement)
    : (FAMILY_ICONS[family] || FAMILY_ICONS.default)

  return (
    <span className={`identity-icon ${className}`.trim()} aria-hidden="true">
      <IconComponent size={size} strokeWidth={1.75} />
    </span>
  )
}

export default IdentityIcon
