import { Fragment, useEffect, useRef, useState } from 'react'
import { UserRoundPlus, Play, Pause, Sprout, ArrowRight, Check, Plus } from 'lucide-react'

// Same accent colors as the hero
const SAGE = '#779787'
const APRICOT = '#E8A87C'
const LILAC = '#B3A7D6'

const steps = [
  {
    n: '01',
    id: 'connect',
    title: 'Connect',
    text: 'Invite your partner and create your shared space.',
    icon: UserRoundPlus,
    color: SAGE,
  },
  {
    n: '02',
    id: 'start',
    title: 'Start',
    text: 'Choose an activity, start your timer and get going.',
    icon: Play,
    color: APRICOT,
  },
  {
    n: '03',
    id: 'grow',
    title: 'Grow',
    text: "See each other's activities, track your time and build better routines.",
    icon: Sprout,
    color: LILAC,
  },
]

const pad = (n) => String(n).padStart(2, '0')
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

const focusRing =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate'

/* ---------- helpers ---------- */

function useReducedMotion() {
  const [reduced, setReduced] = useState(
      () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

// Fires once when the element scrolls into view
function useInView() {
  const ref = useRef(null)
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') return
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

// Words that rise in one after another once `seen` is true
function Words({ text, seen, start = 0 }) {
  return text.split(' ').map((w, i) => (
      <Fragment key={i}>
      <span className={`h-rise inline-block ${seen ? 'in' : ''}`} style={{ '--d': `${(start + i) * 90}ms` }}>
        {w}
      </span>{' '}
      </Fragment>
  ))
}

function Avatar({ letter, color, className = '' }) {
  return (
      <i
          className={`grid h-10 w-10 place-items-center rounded-full border-2 border-white font-serif text-base not-italic text-white ${className}`}
          style={{ backgroundColor: color }}
      >
        {letter}
      </i>
  )
}

// Compact strip that holds each step's small animated visual
function Strip({ as: Tag = 'div', children, className = '', ...rest }) {
  return (
      <Tag
          className={`flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-navy/5 bg-white/80 px-4 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white ${className}`}
          {...rest}
      >
        {children}
      </Tag>
  )
}

/* ---------- step visuals ---------- */

// 01: an invite is sent by itself, your partner joins. Tap to replay.
function ConnectDemo({ reached }) {
  const [phase, setPhase] = useState('idle')
  const timer = useRef(0)
  const auto = useRef(false)

  const run = () => {
    clearTimeout(timer.current)
    setPhase('sending')
    timer.current = setTimeout(() => setPhase('joined'), 900)
  }

  // Plays once by itself when the step is reached
  useEffect(() => {
    if (!reached || auto.current) return
    auto.current = true
    const t = setTimeout(run, 600)
    return () => clearTimeout(t)
  }, [reached])

  useEffect(() => () => clearTimeout(timer.current), [])

  const joined = phase === 'joined'
  const sending = phase === 'sending'

  return (
      <Strip
          as="button"
          type="button"
          onClick={() => !sending && run()}
          aria-label="Replay the connect animation"
          className={`cursor-pointer ${focusRing}`}
      >
        <div className="flex items-center gap-2.5">
          <Avatar letter="M" color={SAGE} />

          <span className="relative flex h-6 w-12 items-center justify-center">
          {joined ? (
              <>
                <span className="absolute inset-x-0 h-[2px] rounded-full bg-slate/30" />
                <span className="h-pop relative grid h-5 w-5 place-items-center rounded-full bg-slate text-white">
                <Check size={12} strokeWidth={3} />
              </span>
              </>
          ) : (
              [0, 0.15, 0.3].map((d) => (
                  <i
                      key={d}
                      className={`mx-0.5 h-1.5 w-1.5 rounded-full bg-slate/40 ${sending ? 'h-dot' : ''}`}
                      style={{ animationDelay: `${d}s` }}
                  />
              ))
          )}
        </span>

          {joined ? (
              <Avatar letter="A" color={APRICOT} className="h-pop" />
          ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-dashed border-navy/20 text-muted">
            <Plus size={14} />
          </span>
          )}
        </div>
        <span className="text-[11px] text-muted" aria-live="polite">
        {joined ? 'Connected · tap to replay' : sending ? 'Sending invite…' : 'Tap to connect'}
      </span>
      </Strip>
  )
}

// 02: a running timer you can pause
function StartDemo({ step }) {
  const [sec, setSec] = useState(24 * 60 + 8)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSec((v) => v + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  return (
      <Strip>
        <div className="flex items-center gap-3">
          <b className="font-serif text-3xl tabular-nums text-navy">
            {pad(Math.floor(sec / 3600))}:{pad(Math.floor((sec % 3600) / 60))}
            <span className={running ? 'animate-pulse-soft' : ''} style={{ color: step.color }}>
            :
          </span>
            {pad(sec % 60)}
          </b>
          <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              aria-label={running ? 'Pause timer' : 'Resume timer'}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-navy transition duration-300 hover:scale-105 active:scale-90 ${focusRing}`}
              style={{ backgroundColor: `${step.color}66` }}
          >
            {running ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
          </button>
        </div>
        <span className="text-[11px] text-muted">Reading · {running ? 'In progress' : 'Paused'}</span>
      </Strip>
  )
}

// 03: a tiny week chart whose bars grow in; hover a bar to read it
const WEEK = [
  ['Mon', 40],
  ['Tue', 75],
  ['Wed', 55],
  ['Thu', 75],
  ['Fri', 40],
  ['Sat', 55],
  ['Sun', 75],
]
const WEEK_MAX = 75

function GrowDemo({ step, reached }) {
  const [sel, setSel] = useState(WEEK.length - 1)

  return (
      <Strip>
        <div className="flex h-12 w-full max-w-[190px] items-end gap-1.5">
          {WEEK.map(([name, min], i) => (
              <button
                  key={name}
                  type="button"
                  onClick={() => setSel(i)}
                  onMouseEnter={() => setSel(i)}
                  onFocus={() => setSel(i)}
                  aria-label={`${name}: ${min} minutes`}
                  aria-pressed={i === sel}
                  className={`flex h-full flex-1 items-end rounded-t-md ${focusRing}`}
              >
            <span
                className="block w-full rounded-t-md transition-[height,background-color] duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                style={{
                  height: reached ? `${(min / WEEK_MAX) * 100}%` : '8%',
                  transitionDelay: reached ? `${i * 70}ms` : '0ms',
                  backgroundColor: i === sel ? '#4f6670' : `${step.color}99`,
                }}
            />
              </button>
          ))}
        </div>
        <span className="text-[11px] tabular-nums text-muted" aria-live="polite">
        {WEEK[sel][0]} · {WEEK[sel][1]} min
      </span>
      </Strip>
  )
}

const DEMOS = { connect: ConnectDemo, start: StartDemo, grow: GrowDemo }

/* ---------- one step: node, connector, demo, text ---------- */

function StepItem({ step, index, last, active, segRef }) {
  const [ref, seen] = useInView()
  const reached = index <= active
  const isCurrent = index === active
  const Demo = DEMOS[step.id]
  const Icon = step.icon

  return (
      <li
          ref={ref}
          className={`h-rise ${seen ? 'in' : ''} relative grid grid-cols-[56px_minmax(0,1fr)] gap-x-4 lg:block`}
          style={{ '--d': `${index * 140}ms` }}
      >
        {/* Connector to the next step: vertical on phones, horizontal on large screens.
          Its fill is driven by scroll (--f) from the parent. */}
        {!last && (
            <span
                ref={segRef}
                aria-hidden="true"
                className="absolute left-7 top-14 h-[calc(100%-56px+2rem)] w-[2px] -translate-x-1/2 rounded-full bg-navy/10 lg:left-1/2 lg:top-7 lg:h-[2px] lg:w-[calc(100%+2rem)] lg:translate-x-0 lg:-translate-y-1/2"
            >
          <span
              className="absolute inset-0 origin-top rounded-full bg-slate [transform:scaleY(var(--f,0))] lg:origin-left lg:[transform:scaleX(var(--f,0))]"
          />
              {/* Dot that travels along the line */}
              <span
                  className="absolute left-1/2 top-[calc(var(--f,0)*100%)] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[var(--t,0)] shadow-[0_0_0_4px_rgba(255,255,255,.9)] transition-opacity duration-200 lg:left-[calc(var(--f,0)*100%)] lg:top-1/2"
                  style={{ backgroundColor: step.color }}
              />
        </span>
        )}

        {/* Node */}
        <div className="relative z-10 lg:mb-6 lg:flex lg:justify-center">
          <div className="relative">
            {isCurrent && (
                <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full opacity-30" style={{ backgroundColor: step.color }} />
            )}
            <div
                className={`relative grid h-14 w-14 place-items-center rounded-full border-2 font-serif text-lg transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
                    reached ? 'scale-100 border-transparent text-navy' : 'scale-90 border-navy/10 bg-white text-muted'
                }`}
                style={reached ? { backgroundColor: step.color } : undefined}
            >
              {step.n}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0">
          <Demo step={step} reached={reached} />
          <h3 className="mb-1.5 mt-5 flex items-center gap-2 font-serif text-2xl text-navy lg:justify-center">
            <Icon size={18} className="text-slate" />
            {step.title}
          </h3>
          <p className="m-0 max-w-[320px] text-sm leading-[1.7] text-[#5f6b70] lg:mx-auto lg:text-center">{step.text}</p>
        </div>
      </li>
  )
}

/* ---------- section ---------- */

export default function HowItWorks() {
  const reduced = useReducedMotion()
  const [headRef, headSeen] = useInView()
  const [ctaRef, ctaSeen] = useInView()
  const [active, setActive] = useState(-1)
  const listRef = useRef(null)
  const segRefs = useRef([])

  // Scroll drives the timeline: lines fill, nodes light up in order
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const n = steps.length

    const apply = (p) => {
      segRefs.current.forEach((seg, i) => {
        if (!seg) return
        const f = clamp(p * (n - 1) - i, 0, 1)
        seg.style.setProperty('--f', f)
        seg.style.setProperty('--t', f > 0.02 && f < 0.98 ? 1 : 0)
      })
      setActive(p <= 0 ? -1 : Math.min(n - 1, Math.floor(p * (n - 1) + 0.02)))
    }

    if (reduced) {
      apply(1)
      return
    }

    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const range = Math.max(r.height * 0.6, 260)
      apply(clamp((window.innerHeight * 0.85 - r.top) / range, 0, 1))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
      <section id="how-it-works" className="relative isolate overflow-hidden bg-soft py-20 md:py-28">
        <style>{`
        .h-rise { opacity: 0; transform: translateY(28px); filter: blur(6px);
          transition: opacity .8s cubic-bezier(.22,1,.36,1) var(--d,0ms), transform .8s cubic-bezier(.22,1,.36,1) var(--d,0ms), filter .8s cubic-bezier(.22,1,.36,1) var(--d,0ms); }
        .h-rise.in { opacity: 1; transform: none; filter: blur(0); }
        @keyframes h-swap { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes h-pop { 0% { opacity: 0; transform: scale(.4); } 60% { transform: scale(1.12); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes h-dot { 0%, 80%, 100% { transform: translateY(0); opacity: .4; } 40% { transform: translateY(-5px); opacity: 1; } }
        .h-swap { animation: h-swap .4s cubic-bezier(.22,1,.36,1) both; }
        .h-pop { animation: h-pop .5s cubic-bezier(.22,1,.36,1) both; }
        .h-dot { animation: h-dot 1s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .h-rise { opacity: 1; transform: none; filter: none; transition: none; }
          .h-swap, .h-pop, .h-dot { animation: none; }
        }
      `}</style>

        {/* Background: flat pale shapes + a plain dot grid */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full bg-[#B3A7D6]/15 sm:h-[360px] sm:w-[360px]" />
          <div className="absolute -bottom-28 -left-20 h-[280px] w-[280px] rounded-full bg-[#779787]/15 sm:h-[340px] sm:w-[340px]" />
          <div className="absolute inset-0 text-navy/[0.1] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <div className="mx-auto w-[calc(100%-40px)] md:w-[min(1160px,calc(100%-64px))]">
          {/* Header */}
          <div ref={headRef} className="mx-auto mb-14 flex max-w-[680px] flex-col items-center text-center md:mb-20">
            <h2 className="m-0 font-serif text-[clamp(38px,5.5vw,64px)] leading-[1.05] tracking-[-0.02em] text-navy">
              <Words text="Simple steps." seen={headSeen} start={1} />
              <br />
              {/* Highlighter swipe behind the second line (clones across line breaks) */}
              <span
                  className="transition-[background-size] delay-[800ms] duration-1000 ease-[cubic-bezier(.22,1,.36,1)] [background-image:linear-gradient(var(--hl),var(--hl))] [background-position:0_90%] [background-repeat:no-repeat] [box-decoration-break:clone]"
                  style={{ '--hl': `${LILAC}99`, backgroundSize: headSeen ? '100% 0.36em' : '0% 0.36em' }}
              >
              <Words text="Better days. Together." seen={headSeen} start={3} />
            </span>
            </h2>
          </div>

          {/* Timeline */}
          <ol ref={listRef} className="m-0 grid list-none gap-y-8 p-0 lg:grid-cols-3 lg:gap-x-8">
            {steps.map((s, i) => (
                <StepItem
                    key={s.id}
                    step={s}
                    index={i}
                    last={i === steps.length - 1}
                    active={active}
                    segRef={(el) => (segRefs.current[i] = el)}
                />
            ))}
          </ol>

          {/* CTA */}
          <div ref={ctaRef} className={`h-rise ${ctaSeen ? 'in' : ''} mt-14 flex justify-center md:mt-20`}>
            <a
                href="#about"
                className={`group inline-flex items-center gap-3 rounded-full bg-navy py-2 pl-6 pr-2 text-xs font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate hover:shadow-[0_16px_30px_-16px] hover:shadow-navy/60 ${focusRing}`}
            >
              <span className="text-white">Start growing together</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ivory text-navy transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={15} />
            </span>
            </a>
          </div>
        </div>
      </section>
  )
}
