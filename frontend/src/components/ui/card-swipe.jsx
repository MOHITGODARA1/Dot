import { useState } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
} from 'motion/react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Book02Icon,
  Brain02Icon,
  DropletIcon,
  RunningShoesIcon,
  SwimmingIcon,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

const DEFAULT_CARDS = [
  {
    id: 1,
    title: 'Reading',
    description: 'Sharpen your mind & escape to new adventures.',
    icon: () => (
      <HugeiconsIcon
        icon={Book02Icon}
        size={52}
        color="currentColor"
        strokeWidth={1.5}
      />
    ),
  },
  {
    id: 2,
    title: 'Drink Water',
    description: 'Stay hydrated & energized. Your body will thank you!',
    icon: () => (
      <HugeiconsIcon
        icon={DropletIcon}
        size={52}
        color="currentColor"
        strokeWidth={1.5}
      />
    ),
  },
  {
    id: 3,
    title: 'Running',
    description: 'Feel the endorphins! Get a quick energy boost.',
    icon: () => (
      <HugeiconsIcon
        icon={RunningShoesIcon}
        size={52}
        color="currentColor"
        strokeWidth={1.5}
      />
    ),
  },
  {
    id: 4,
    title: 'Swimming',
    description: 'Low-impact workout. Refreshing & invigorating.',
    icon: () => (
      <HugeiconsIcon
        icon={SwimmingIcon}
        size={52}
        color="currentColor"
        strokeWidth={1.5}
      />
    ),
  },
  {
    id: 5,
    title: 'Meditation',
    description: 'Find inner peace. Just 5 minutes can de-stress.',
    icon: () => (
      <HugeiconsIcon
        icon={Brain02Icon}
        size={52}
        color="currentColor"
        strokeWidth={1.5}
      />
    ),
  },
]

const ITEM_WIDTH = 280
const GAP = 16
const CONTAINER_WIDTH = ITEM_WIDTH + GAP
const DRAG_BUFFER = 50
const VELOCITY_THRESHOLD = 500

const SPRING_OPTIONS = {
  type: 'spring',
  stiffness: 330,
  damping: 30,
}

function CarouselCard({ item, index, x, itemCount, accent }) {
  const nextIndex = Math.min(index + 1, itemCount - 1)
  const prevIndex = Math.max(index - 1, 0)

  const range = [
    (-100 * (index + 1) * CONTAINER_WIDTH) / 100,
    (-100 * index * CONTAINER_WIDTH) / 100,
    (-100 * (index - 1) * CONTAINER_WIDTH) / 100,
  ]
  const outputRange = [nextIndex ? 90 : 90, 0, prevIndex ? -90 : -90]

  const rotateY = useTransform(x, range, outputRange, { clamp: false })

  return (
    <motion.div
      style={{
        width: ITEM_WIDTH,
        height: 400,
        rotateY,
        flexShrink: 0,
      }}
      transition={SPRING_OPTIONS}
      className="flex cursor-grab flex-col items-start rounded-[32px] border-[1.6px] border-navy/10 bg-white p-7 transition-colors active:cursor-grabbing sm:p-8"
    >
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-[1.6px] border-navy/10 text-navy shadow-[0_6px_20px_rgba(41,61,74,0.08)] sm:mb-8 sm:h-20 sm:w-20"
        style={{ backgroundColor: accent ? `${accent}40` : undefined }}
      >
        {typeof item.icon === 'function' ? item.icon() : item.icon}
      </div>

      {item.number && (
        <span className="mb-1 text-[11px] tracking-widest text-muted">
          {item.number}
        </span>
      )}

      <h2 className="mb-2 font-serif text-2xl font-normal leading-tight text-navy sm:text-[28px]">
        {item.title}
      </h2>

      <p className="mb-5 flex-1 font-sans text-base leading-relaxed text-muted sm:text-lg">
        {item.description}
      </p>

      {item.tag && (
        <span
          className="mt-auto inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-navy"
          style={{ backgroundColor: accent ? `${accent}55` : 'rgba(41,61,74,0.08)' }}
        >
          <i
            className="h-[7px] w-[7px] rounded-full"
            style={{
              backgroundColor: accent || '#779787',
              boxShadow: `0 0 0 4px ${accent || '#779787'}33`,
            }}
          />
          {item.tag}
        </span>
      )}
    </motion.div>
  )
}

export function CardSwipe({ items = DEFAULT_CARDS }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const x = useMotionValue(0)

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1))
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0))
    }
  }

  const leftConstraint = -((ITEM_WIDTH + GAP) * (items.length - 1))
  const current = items[currentIndex]

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div
        className="relative overflow-hidden"
        style={{ width: ITEM_WIDTH, height: 400 }}
      >
        <motion.div
          className="flex"
          drag="x"
          dragConstraints={{ left: leftConstraint, right: 0 }}
          style={{
            gap: GAP,
            perspective: 1000,
            perspectiveOrigin: currentIndex * ITEM_WIDTH + ITEM_WIDTH / 2,
            x,
          }}
          onDragEnd={handleDragEnd}
          animate={{ x: -(currentIndex * CONTAINER_WIDTH) }}
          transition={SPRING_OPTIONS}
        >
          {items.map((item, index) => (
            <CarouselCard
              key={item.id}
              item={item}
              index={index}
              x={x}
              itemCount={items.length}
              accent={item.color}
            />
          ))}
        </motion.div>
      </div>

      <div className="mt-5 flex gap-3">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Go to ${item.title}`}
            aria-current={currentIndex === i ? 'true' : undefined}
            className={cn(
              'h-2 w-2 rounded-full transition-colors duration-200',
              currentIndex === i ? 'bg-navy' : 'bg-navy/20',
            )}
            style={
              currentIndex === i && current?.color
                ? { backgroundColor: current.color }
                : undefined
            }
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}

export default CardSwipe
