import { Fragment, useEffect, useRef, useState } from 'react'
import {
  Activity,
  Clock3,
  CalendarDays,
  MessageCircleHeart,
  Check,
  Heart,
  Sparkles,
  Pause,
  Play,
} from 'lucide-react'

// Same accent colors as the hero
const SAGE = '#779787'
const APRICOT = '#E8A87C'
const LILAC = '#B3A7D6'

const features = [
  {
    id: 'live',
    number: '01',
    icon: Activity,
    title: "See what they're up to.",
    text: "Share your current activity and let your partner see what you're doing in real time.",
    color: SAGE,
    span: 'lg:col-span-7',
  },
  {
    id: 'time',
    number: '02',
    icon: Clock3,
    title: 'Every minute matters.',
    text: 'Start an activity, track the time you spend and keep a record of your everyday progress.',
    color: LILAC,
    span: 'lg:col-span-5',
  },
  {
    id: 'habits',
    number: '03',
    icon: CalendarDays,
    title: 'Build routines together.',
    text: "Create recurring habits, plan your routines and stay consistent with each other's support.",
    color: APRICOT,
    span: 'lg:col-span-5',
  },
  {
    id: 'moments',
    number: '04',
    icon: MessageCircleHeart,
    title: 'Stay connected throughout the day.',
    text: 'See activity updates, celebrate small achievements and encourage each other.',
    color: SAGE,
    span: 'lg:col-span-7',
  },
]

const pad = (n) => String(n).padStart(2, '0')

/* ---------- helpers ---------- */

// Fires once when the element scrolls into view
function useInView() {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setSeen(true)
            io.disconnect()
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, seen]
}

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, seen] = useInView()
  return (
      <div ref={ref} className={`f-rise h-full ${seen ? 'in' : ''} ${className}`} style={{ '--d': `${delay}ms` }}>
        {children}
      </div>
  )
}

// Words that rise in one after another once `seen` is true
function Words({ text, seen, start = 0 }) {
  return text.split(' ').map((w, i) => (
      <Fragment key={i}>
      <span className={`f-rise inline-block ${seen ? 'in' : ''}`} style={{ '--d': `${(start + i) * 90}ms` }}>
        {w}
      </span>{' '}
      </Fragment>
  ))
}

function Avatar({ letter, color, className = '' }) {
  return (
      <i
          className={`grid h-6 w-6 place-items-center rounded-full border-2 border-white text-[10px] font-semibold not-italic text-white ${className}`}
          style={{ backgroundColor: color }}
      >
        {letter}
      </i>
  )
}

const miniCard = 'rounded-2xl bg-white p-4 shadow-[0_16px_36px_-20px] shadow-navy/40'

/* ---------- illustrations ---------- */

function LiveIllustration({ color }) {
  const [s, setS] = useState(32 * 60 + 7)
  useEffect(() => {
    const id = setInterval(() => setS((v) => v + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
      <div className="w-full max-w-[360px] space-y-2.5">
        <div className={`${miniCard} flex items-center gap-3.5`}>
        <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-navy"
            style={{ backgroundColor: `${color}40` }}
        >
          <Activity size={20} />
        </span>
          <div className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: color }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            </span>
            Live now
          </span>
            <b className="mt-0.5 block text-[13px] text-navy">Morning movement</b>
            <span className="block text-[11px] tabular-nums text-muted">
            Mohit · {pad(Math.floor(s / 60))}:{pad(s % 60)}
          </span>
          </div>
          {/* Equalizer bars */}
          <div className="flex h-8 items-end gap-[3px]" aria-hidden="true">
            {[0.2, 0.55, 0.1, 0.75, 0.35].map((d, i) => (
                <i
                    key={i}
                    className="f-eq block h-full w-[3px] origin-bottom rounded-full"
                    style={{ backgroundColor: color, animationDelay: `${d}s` }}
                />
            ))}
          </div>
        </div>

        <div className="ml-6 flex w-fit items-center gap-2.5 rounded-full bg-white/80 py-1.5 pl-1.5 pr-4 text-[11px] text-slate shadow-[0_10px_24px_-16px] shadow-navy/40">
          <Avatar letter="A" color={APRICOT} />
          Alex is cheering you on
        </div>
      </div>
  )
}

function TimeIllustration({ color }) {
  const [sec, setSec] = useState(38 * 60 + 24)
  const [running, setRunning] = useState(true)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSec((v) => Math.min(v + 1, 3600)), 1000)
    return () => clearInterval(id)
  }, [running])

  const pct = (sec / 3600) * 100

  return (
      <div className={`${miniCard} w-full max-w-[320px] px-5 py-4`}>
        <small className="text-[11px] text-muted">Your focus session</small>
        <div className="my-1 flex items-center justify-between gap-3">
          <strong className="font-serif text-4xl tabular-nums text-navy">
            {pad(Math.floor(sec / 3600))}:{pad(Math.floor((sec % 3600) / 60))}
            <span className={running ? 'animate-pulse-soft' : ''} style={{ color }}>
            :
          </span>
            {pad(sec % 60)}
          </strong>
          <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              aria-label={running ? 'Pause session' : 'Resume session'}
              className="grid h-10 w-10 place-items-center rounded-full text-navy transition duration-300 hover:scale-105 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate"
              style={{ backgroundColor: `${color}55` }}
          >
            {running ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-navy/10">
          <div
              className="h-full rounded-full transition-[width] duration-1000 ease-linear"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, #779787)` }}
          />
        </div>
        <span className="mt-2.5 block text-[11px] text-muted">
        {running ? 'A little progress, together.' : 'Paused. Tap play to keep going.'}
      </span>
      </div>
  )
}

const HABITS = [
  { label: 'Morning stretch', who: [['M', SAGE], ['A', APRICOT]], color: SAGE },
  { label: 'Read together', who: [['M', SAGE]], color: LILAC },
  { label: 'Evening walk', who: [['M', SAGE], ['A', APRICOT]], color: APRICOT },
]

function HabitsIllustration() {
  const [done, setDone] = useState([true, true, false])
  const count = done.filter(Boolean).length

  return (
      <div className={`${miniCard} w-full max-w-[340px]`}>
        <div className="mb-2 flex items-center justify-between">
          <b className="font-serif text-lg text-navy">Our rhythm</b>
          <span className="rounded-full bg-soft px-2.5 py-1 text-[11px] font-medium text-slate tabular-nums">{count}/3 today</span>
        </div>
        {HABITS.map((h, i) => (
            <button
                key={h.label}
                type="button"
                onClick={() => setDone((d) => d.map((v, idx) => (idx === i ? !v : v)))}
                aria-pressed={done[i]}
                className="flex w-full items-center gap-3 rounded-xl border-t border-navy/5 px-1 py-2.5 text-left text-[13px] text-navy transition-colors duration-200 first:border-t-0 hover:bg-soft/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate"
            >
          <span
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 text-white transition-all duration-300"
              style={{ borderColor: h.color, backgroundColor: done[i] ? h.color : 'transparent' }}
          >
            <Check size={12} strokeWidth={3} className={`transition-all duration-300 ${done[i] ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
          </span>
              <span className={`transition-colors duration-300 ${done[i] ? 'text-navy' : 'text-[#5f6b70]'}`}>{h.label}</span>
              <span className="ml-auto flex">
            {h.who.map(([l, c], k) => (
                <Avatar key={l} letter={l} color={c} className={k ? '-ml-1.5' : ''} />
            ))}
          </span>
            </button>
        ))}
        <p className="m-0 mt-1 h-4 text-[11px] text-muted" aria-live="polite">
          {count === 3 ? 'All done. Nice rhythm.' : 'Tap a habit to check it off.'}
        </p>
      </div>
  )
}

function MomentsIllustration() {
  const [items, setItems] = useState([
    { avatar: 'A', color: APRICOT, title: 'Alex finished a run', meta: 'Just now · 28 min', icon: Heart, liked: false, count: 1 },
    { avatar: 'M', color: SAGE, title: 'You read for a while', meta: 'Earlier today · 42 min', icon: Sparkles, liked: false, count: 0 },
  ])

  const toggle = (i) =>
      setItems((prev) =>
          prev.map((it, idx) =>
              idx === i ? { ...it, liked: !it.liked, count: it.count + (it.liked ? -1 : 1) } : it
          )
      )

  return (
      <div className={`${miniCard} w-full max-w-[380px] px-4 py-2`}>
        {items.map((it, i) => {
          const Icon = it.icon
          return (
              <div key={it.title} className="flex items-center gap-3 border-b border-navy/5 py-3 last:border-0">
                <Avatar letter={it.avatar} color={it.color} className="!h-8 !w-8 !text-xs" />
                <span className="min-w-0 flex-1">
              <b className="block truncate text-[13px] text-navy">{it.title}</b>
              <small className="mt-0.5 block text-[11px] text-muted">{it.meta}</small>
            </span>
                <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-pressed={it.liked}
                    aria-label={`React to "${it.title}"`}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] tabular-nums transition-colors duration-200 hover:bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate"
                    style={{ color: it.liked ? '#c07a4a' : '#8a9499' }}
                >
              <span className={it.liked ? 'f-pop inline-flex' : 'inline-flex'}>
                <Icon size={15} fill={it.liked ? APRICOT : 'none'} color={it.liked ? '#c07a4a' : 'currentColor'} />
              </span>
                  {it.count > 0 && it.count}
                </button>
              </div>
          )
        })}

        {/* Typing indicator */}
        <div className="flex items-center gap-2.5 py-3 text-[11px] text-muted">
          <Avatar letter="A" color={APRICOT} className="!h-8 !w-8 !text-xs" />
          <span className="flex items-center gap-1 rounded-full bg-soft px-3 py-2" aria-hidden="true">
          {[0, 0.15, 0.3].map((d) => (
              <i key={d} className="f-dot block h-1.5 w-1.5 rounded-full bg-slate/60" style={{ animationDelay: `${d}s` }} />
          ))}
        </span>
          Alex is writing a note
        </div>
      </div>
  )
}

const ILLUSTRATIONS = {
  live: LiveIllustration,
  time: TimeIllustration,
  habits: HabitsIllustration,
  moments: MomentsIllustration,
}

/* ---------- card ---------- */

function FeatureCard({ feature, index }) {
  const { id, number, icon: Icon, title, text, color, span } = feature
  const Illustration = ILLUSTRATIONS[id]

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
  }

  return (
      <Reveal delay={index * 110} className={`col-span-1 ${span}`}>
        <article
            onMouseMove={onMove}
            className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-navy/5 bg-soft p-6 transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_50px_-28px] hover:shadow-navy/40 sm:p-7"
        >
          {/* Accent wash in the corner, glows on hover */}
          <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
              style={{ backgroundColor: color }}
          />
          {/* Cursor spotlight */}
          <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: 'radial-gradient(280px circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,.55), transparent 70%)' }}
          />

          <div className="relative flex items-center justify-between">
          <span
              className="grid h-10 w-10 place-items-center rounded-full text-navy transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-rotate-6 group-hover:scale-110"
              style={{ backgroundColor: `${color}55` }}
          >
            <Icon size={19} />
          </span>
            <span className="text-[11px] tracking-widest text-muted">{number}</span>
          </div>

          <div className="relative flex min-h-[220px] flex-1 items-center justify-center py-7">
            <Illustration color={color} />
          </div>

          <div className="relative">
            <h3 className="mb-2 font-serif text-2xl text-navy sm:text-[26px]">{title}</h3>
            <p className="m-0 max-w-[400px] text-[13px] leading-[1.75] text-[#5f6b70]">{text}</p>
          </div>
        </article>
      </Reveal>
  )
}

/* ---------- section ---------- */

export default function Features() {
  const [headRef, headSeen] = useInView()

  return (
      <section id="features" className="mx-auto w-[calc(100%-40px)] py-20 md:w-[min(1160px,calc(100%-64px))] md:py-28">
        <style>{`
        .f-rise { opacity: 0; transform: translateY(28px); filter: blur(6px);
          transition: opacity .8s cubic-bezier(.22,1,.36,1) var(--d,0ms), transform .8s cubic-bezier(.22,1,.36,1) var(--d,0ms), filter .8s cubic-bezier(.22,1,.36,1) var(--d,0ms); }
        .f-rise.in { opacity: 1; transform: none; filter: blur(0); }
        @keyframes f-eq { 0%, 100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
        @keyframes f-pop { 0% { transform: scale(1); } 40% { transform: scale(1.5); } 100% { transform: scale(1); } }
        @keyframes f-dot { 0%, 80%, 100% { transform: translateY(0); opacity: .5; } 40% { transform: translateY(-4px); opacity: 1; } }
        .f-eq { animation: f-eq 1s ease-in-out infinite; }
        .f-pop { animation: f-pop .45s cubic-bezier(.22,1,.36,1); }
        .f-dot { animation: f-dot 1.1s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .f-rise { opacity: 1; transform: none; filter: none; transition: none; }
          .f-eq, .f-pop, .f-dot { animation: none; }
        }
      `}</style>

        {/* Header */}
        <div ref={headRef} className="mx-auto mb-12 flex max-w-[680px] flex-col items-center text-center md:mb-16">


          <h2 className="my-5 font-serif text-[clamp(38px,5.5vw,64px)] leading-[1.05] tracking-[-0.02em] text-navy">
            <Words text="More than habits." seen={headSeen} start={1} />
            <br />
            {/* Highlighter swipe behind the second line (clones across line breaks) */}
            <span
                className="transition-[background-size] delay-[900ms] duration-1000 ease-[cubic-bezier(.22,1,.36,1)] [background-image:linear-gradient(var(--hl),var(--hl))] [background-position:0_90%] [background-repeat:no-repeat] [box-decoration-break:clone]"
                style={{ '--hl': `${APRICOT}80`, backgroundSize: headSeen ? '100% 0.36em' : '0% 0.36em' }}
            >
            <Words text="A shared everyday." seen={headSeen} start={4} />
          </span>
          </h2>

          <p
              className={`f-rise ${headSeen ? 'in' : ''} m-0 max-w-[440px] text-sm leading-[1.8] text-muted md:text-[15px]`}
              style={{ '--d': '700ms' }}
          >
            Everything you need to stay connected, track your time and build meaningful routines together.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-12">
          {features.map((f, i) => (
              <FeatureCard key={f.id} feature={f} index={i} />
          ))}
        </div>
      </section>
  )
}