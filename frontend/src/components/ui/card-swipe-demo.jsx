import {
  Activity,
  Clock3,
  CalendarDays,
  MessageCircleHeart,
} from 'lucide-react'
import { CardSwipe } from './card-swipe'

const SAGE = '#779787'
const APRICOT = '#E8A87C'
const LILAC = '#B3A7D6'

const featureItems = [
  {
    id: 1,
    number: '01',
    tag: 'Live presence',
    title: "See what they're up to.",
    description:
      "Share your current activity and let your partner see what you're doing in real time.",
    color: SAGE,
    icon: () => <Activity size={28} strokeWidth={1.75} />,
  },
  {
    id: 2,
    number: '02',
    tag: 'Time tracking',
    title: 'Every minute matters.',
    description:
      'Start an activity, track the time you spend and keep a record of your everyday progress.',
    color: LILAC,
    icon: () => <Clock3 size={28} strokeWidth={1.75} />,
  },
  {
    id: 3,
    number: '03',
    tag: 'Shared routines',
    title: 'Build routines together.',
    description:
      "Create recurring habits, plan your routines and stay consistent with each other's support.",
    color: APRICOT,
    icon: () => <CalendarDays size={28} strokeWidth={1.75} />,
  },
  {
    id: 4,
    number: '04',
    tag: 'Little moments',
    title: 'Stay connected throughout the day.',
    description:
      'See activity updates, celebrate small achievements and encourage each other.',
    color: SAGE,
    icon: () => <MessageCircleHeart size={28} strokeWidth={1.75} />,
  },
]

export default function CardSwipeDemo() {
  return (
    <div className="flex items-center justify-center">
      <CardSwipe items={featureItems} />
    </div>
  )
}
