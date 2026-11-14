import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Play } from 'lucide-react'

// Habit colors (swap for Tailwind tokens if you add them to your config)
const SAGE = '#779787'
const APRICOT = '#E8A87C'
const LILAC = '#B3A7D6'
const PALETTE = [SAGE, APRICOT, LILAC]

const DAYS = [
  { short: 'M', name: 'Monday', color: SAGE },
  { short: 'T', name: 'Tuesday', color: APRICOT },
  { short: 'W', name: 'Wednesday', color: LILAC },
  { short: 'T', name: 'Thursday', color: SAGE },
  { short: 'F', name: 'Friday', color: APRICOT },
  { short: 'S', name: 'Saturday', color: LILAC },
  { short: 'S', name: 'Sunday', color: SAGE },
]

// Words that rotate in the heading: "Make every ____ count, together."
const WORDS = [
  { text: 'day', color: SAGE },
  { text: 'habit', color: APRICOT },
  { text: 'moment', color: LILAC },
  { text: 'morning', color: SAGE },
  { text: 'step', color: APRICOT },
]

// Floating cards (shown on wide screens, they react to the mouse and can be ticked off)
const CHIPS = [
  { label: 'Morning run', meta: '12 day streak', color: SAGE, pos: 'left-0 top-[4%]', depth: 22, float: '7s' },
  { label: 'Drink water', meta: '6 of 8 glasses', color: APRICOT, pos: 'left-[6%] top-[60%]', depth: -16, float: '8.5s' },
  { label: 'Read 20 pages', meta: '4 day streak', color: LILAC, pos: 'right-0 top-[10%]', depth: -20, float: '7.5s' },
  { label: 'Meditate', meta: '5 minutes', color: SAGE, pos: 'right-[5%] top-[62%]', depth: 18, float: '9s' },
]

const MARQUEE = [
  ['Morning run', SAGE],
  ['Drink water', APRICOT],
  ['Read 20 pages', LILAC],
  ['Meditate', SAGE],
  ['Journal', APRICOT],
  ['Stretch', LILAC],
  ['Walk the dog', SAGE],
  ['Sleep by 11', APRICOT],
]

const todayIndex = (new Date().getDay() + 6) % 7 // Monday-first

const focusRing =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate'

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

// The rotating word: the active word fades up, the old one floats away, a highlighter swipes in behind it
function RotatingWord({ wi }) {
  const n = WORDS.length
  return (
      <span className="hero-char relative inline-grid align-baseline" style={{ animationDelay: '465ms' }}>
      {WORDS.map((w, i) => {
        const state = i === wi ? 'on' : i === (wi - 1 + n) % n ? 'out' : 'wait'
        return (
            <span
                key={w.text}
                className="relative isolate col-start-1 row-start-1 justify-self-center whitespace-nowrap transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                style={{
                  opacity: state === 'on' ? 1 : 0,
                  transform: state === 'on' ? 'none' : state === 'out' ? 'translateY(-0.45em)' : 'translateY(0.45em)',
                  filter: state === 'on' ? 'blur(0)' : 'blur(8px)',
                }}
            >
            <span
                aria-hidden="true"
                className="absolute -inset-x-[0.06em] bottom-[0.1em] -z-10 h-[0.38em] origin-left rounded-sm transition-transform delay-200 duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                style={{ backgroundColor: `${w.color}80`, transform: state === 'on' ? 'scaleX(1)' : 'scaleX(0)' }}
            />
              {w.text}
          </span>
        )
      })}
    </span>
  )
}

// A word whose letters rise in one after another (start = how many letters came before it)
function AnimatedWord({ word, start }) {
  return (
      <span className="inline-block whitespace-nowrap">
      {word.split('').map((ch, i) => (
          <span key={i} className="hero-char inline-block" style={{ animationDelay: `${150 + (start + i) * 35}ms` }}>
          {ch}
        </span>
      ))}
    </span>
  )
}

export default function Hero() {
  const reduced = useReducedMotion()
  const sectionRef = useRef(null)
  const burstId = useRef(0)

  const [wi, setWi] = useState(0)
  const [done, setDone] = useState([true, true, true, false, true, false, false])
  const [chips, setChips] = useState([false, false, false, false])
  const [bursts, setBursts] = useState([])
  const count = done.filter(Boolean).length

  // Rotate the heading word
  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setWi((i) => (i + 1) % WORDS.length), 2600)
    return () => clearInterval(id)
  }, [reduced])

  // Mouse parallax: write normalized pointer position into CSS variables
  const onPointerMove = (e) => {
    if (reduced || e.pointerType !== 'mouse' || !sectionRef.current) return
    const r = sectionRef.current.getBoundingClientRect()
    sectionRef.current.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 2 - 1)
    sectionRef.current.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 2 - 1)
  }
  const onPointerLeave = () => {
    sectionRef.current?.style.setProperty('--mx', 0)
    sectionRef.current?.style.setProperty('--my', 0)
  }

  const toggleDay = (i) => {
    setDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
    if (!done[i] && !reduced) {
      const id = ++burstId.current
      setBursts((b) => [...b, { id, i }])
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 750)
    }
  }

  const toggleChip = (i) => setChips((prev) => prev.map((v, idx) => (idx === i ? !v : v)))

  return (
      <section
          ref={sectionRef}
          id="home"
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          className="relative overflow-hidden pb-14 pt-28 sm:pt-32 md:pb-20 md:pt-40 lg:flex lg:min-h-[100svh] lg:flex-col lg:justify-center"
      >
        <style>{`
        @keyframes hero-in { from { opacity: 0; transform: translateY(24px); filter: blur(6px); } to { opacity: 1; transform: none; filter: blur(0); } }
        @keyframes hero-char { from { opacity: 0; transform: translateY(.6em) rotate(5deg); filter: blur(10px); } to { opacity: 1; transform: none; filter: blur(0); } }
        @keyframes hero-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes hero-burst { from { opacity: 1; transform: translate(-50%, -50%) scale(1); } to { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(.2); } }
        @keyframes hero-marquee { to { transform: translateX(-50%); } }
        .hero-in { animation: hero-in .9s cubic-bezier(.22,1,.36,1) both; animation-delay: var(--d, 0ms); }
        .hero-char { animation: hero-char .9s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-in, .hero-char { animation: none; }
          .hero-float, .hero-marquee { animation: none !important; }
        }
      `}</style>

        {/* Background: color washes that drift against the cursor + a faint dot grid */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div
              className="absolute -left-24 top-24 transition-transform duration-500 ease-out"
              style={{ transform: 'translate3d(calc(var(--mx, 0) * -30px), calc(var(--my, 0) * -20px), 0)' }}
          >
            <div className="h-[260px] w-[260px] animate-breathe rounded-full bg-[#779787]/25 blur-3xl sm:h-[340px] sm:w-[340px]" />
          </div>
          <div
              className="absolute -right-20 top-40 transition-transform duration-500 ease-out"
              style={{ transform: 'translate3d(calc(var(--mx, 0) * 26px), calc(var(--my, 0) * -24px), 0)' }}
          >
            <div className="h-[240px] w-[240px] animate-breathe rounded-full bg-[#E8A87C]/25 blur-3xl [animation-delay:1.5s] sm:h-[300px] sm:w-[300px]" />
          </div>
          <div
              className="absolute left-1/2 top-[55%] transition-transform duration-500 ease-out"
              style={{ transform: 'translate3d(calc(-50% + var(--mx, 0) * 18px), calc(var(--my, 0) * 18px), 0)' }}
          >
            <div className="h-[220px] w-[320px] rounded-full bg-[#B3A7D6]/25 blur-3xl sm:h-[280px] sm:w-[420px]" />
          </div>
          <div className="absolute inset-0 text-navy/20 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_50%_35%,black_20%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto w-[calc(100%-40px)] md:w-[min(2060px,calc(100%-64px))]">
          {/* Floating habit cards (wide screens only) */}
          <div className="pointer-events-none absolute inset-0 hidden xl:block">
            {CHIPS.map((c, i) => (
                <div key={c.label} className={`hero-in absolute ${c.pos}`} style={{ '--d': `${1000 + i * 120}ms` }}>
                  <div
                      className="transition-transform duration-300 ease-out"
                      style={{ transform: `translate3d(calc(var(--mx, 0) * ${c.depth}px), calc(var(--my, 0) * ${c.depth}px), 0)` }}
                  >
                    <button
                        type="button"
                        onClick={() => toggleChip(i)}
                        aria-pressed={chips[i]}
                        className={`hero-float pointer-events-auto flex items-center gap-3 rounded-2xl border border-navy/10 bg-ivory/85 py-2.5 pl-2.5 pr-5 text-left shadow-[0_18px_36px_-20px] shadow-navy/50 backdrop-blur transition-shadow duration-300 hover:shadow-[0_22px_40px_-18px] ${focusRing}`}
                        style={{ animation: `hero-float ${c.float} ease-in-out ${i * 0.6}s infinite` }}
                    >
                  <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 transition-all duration-300"
                      style={{
                        borderColor: c.color,
                        backgroundColor: chips[i] ? c.color : 'transparent',
                        color: '#fff',
                      }}
                  >
                    <Check
                        size={16}
                        strokeWidth={3}
                        className={`transition-all duration-300 ${chips[i] ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                    />
                  </span>
                      <span className="flex flex-col">
                    <span className="text-xs font-semibold text-navy">{c.label}</span>
                    <span className="text-[11px] text-muted">{chips[i] ? 'Done today' : c.meta}</span>
                  </span>
                    </button>
                  </div>
                </div>
            ))}
          </div>

          <div className="relative z-10 mx-auto flex max-w-[1060px] flex-col items-center text-center">
            {/* Heading */}
            <h1 className="m-0 mb-6 mt-0 text-balance font-serif text-[clamp(46px,9vw,108px)] leading-[1] tracking-[-0.02em] text-navy sm:mb-7">
              <span className="sr-only">Make every day count, together.</span>
              <span aria-hidden="true" className="sm:block">
              <AnimatedWord word="Make" start={0} /> <AnimatedWord word="every" start={4} /> <RotatingWord wi={wi} />
            </span>{' '}
              <span aria-hidden="true" className="sm:block">
              <AnimatedWord word="count," start={10} />{' '}
                <span className="inline-block whitespace-nowrap">
                <AnimatedWord word="together" start={16} />
                  {/* The period is a dot that changes color with the rotating word */}
                  <span
                      className="hero-char ml-[0.03em] inline-block h-[0.15em] w-[0.15em] rounded-full align-baseline transition-colors duration-700"
                      style={{ backgroundColor: WORDS[wi].color, animationDelay: '990ms' }}
                  />
              </span>
            </span>
            </h1>

            <p className="hero-in m-0 max-w-[480px] text-[15px] leading-[1.8] text-[#69747a] sm:text-base" style={{ '--d': '1100ms' }}>
              Share your everyday moments, build better routines and see how you grow together. One
              habit at a time.
            </p>

            {/* Interactive week of dots */}
            <div className="hero-in mt-8 flex w-full flex-col items-center gap-3 sm:mt-9" style={{ '--d': '1250ms' }}>
              <div className="flex max-w-full items-center gap-1 rounded-full border border-navy/10 bg-ivory/80 px-2.5 py-2.5 shadow-[0_14px_30px_-20px] shadow-navy/40 backdrop-blur sm:gap-2.5 sm:px-4 sm:py-3">
                {DAYS.map((d, i) => {
                  const on = done[i]
                  return (
                      <div key={d.name} className="relative">
                        <button
                            type="button"
                            onClick={() => toggleDay(i)}
                            aria-pressed={on}
                            aria-label={`${d.name}${i === todayIndex ? ' (today)' : ''}`}
                            className={`grid h-8 w-8 place-items-center rounded-full border text-[11px] font-semibold transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 active:scale-90 sm:h-9 sm:w-9 ${focusRing} ${
                                on ? 'border-transparent text-white' : 'border-navy/15 bg-white/60 text-[#69747a]'
                            } ${i === todayIndex ? 'ring-2 ring-slate/30 ring-offset-2 ring-offset-ivory' : ''}`}
                            style={on ? { backgroundColor: d.color } : undefined}
                        >
                          {d.short}
                        </button>

                        {/* Tiny confetti burst when a dot is checked */}
                        {bursts
                            .filter((b) => b.i === i)
                            .map((b) =>
                                Array.from({ length: 8 }, (_, k) => {
                                  const a = (k / 8) * Math.PI * 2
                                  return (
                                      <span
                                          key={`${b.id}-${k}`}
                                          aria-hidden="true"
                                          className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
                                          style={{
                                            backgroundColor: PALETTE[k % 3],
                                            '--dx': `${Math.cos(a) * 28}px`,
                                            '--dy': `${Math.sin(a) * 28}px`,
                                            animation: 'hero-burst .7s cubic-bezier(.22,1,.36,1) forwards',
                                          }}
                                      />
                                  )
                                })
                            )}
                      </div>
                  )
                })}
              </div>

              {/* Progress */}
              <div className="flex w-full max-w-[260px] flex-col items-center gap-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
                  <div
                      className="h-full rounded-full bg-gradient-to-r from-[#779787] via-[#E8A87C] to-[#B3A7D6] transition-[width] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
                      style={{ width: `${(count / 7) * 100}%` }}
                  />
                </div>
                <p className="m-0 text-xs text-muted" aria-live="polite">
                  {count === 7 ? 'Perfect week. Nice work.' : `${count} of 7 days done. Tap a dot to try it.`}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div
                className="hero-in mt-8 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row sm:gap-6"
                style={{ '--d': '1400ms' }}
            >
              <a
                  href="#features"
                  className={`group inline-flex w-full max-w-[300px] items-center justify-between gap-3 rounded-full bg-navy py-2 pl-6 pr-2 text-xs font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate hover:shadow-[0_16px_30px_-16px] hover:shadow-navy/60 sm:w-auto sm:justify-start ${focusRing}`}
              >
                <span className="text-white">Get Started</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-ivory text-navy transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight size={15} />
              </span>
              </a>

              <a href="#how-it-works" className={`group flex items-center gap-2.5 rounded-full py-1 pr-3 text-xs font-semibold text-navy ${focusRing}`}>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-dusty bg-ivory/70 text-slate transition duration-300 group-hover:scale-105 group-hover:bg-soft">
                <Play size={12} fill="currentColor" />
              </span>
                Discover Dot
              </a>
            </div>

            {/* Social proof */}
            <div
                className="hero-in mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-[11px] text-muted sm:mt-10"
                style={{ '--d': '1550ms' }}
            >
            <span className="flex">
              {[
                ['M', SAGE],
                ['A', APRICOT],
                ['J', LILAC],
              ].map(([letter, color], i) => (
                  <i
                      key={letter}
                      className={`grid h-[26px] w-[26px] place-items-center rounded-full border-2 border-ivory text-[10px] font-semibold not-italic text-white ${
                          i ? '-ml-[7px]' : ''
                      }`}
                      style={{ backgroundColor: color }}
                  >
                    {letter}
                  </i>
              ))}
            </span>
              Made for two. Designed for everyday life.
            </div>
          </div>
        </div>

        {/* Endless strip of habits; pauses on hover */}
        <div
            aria-hidden="true"
            className="hero-in group relative mt-12 w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)] md:mt-16"
            style={{ '--d': '1700ms' }}
        >
          <div className="hero-marquee flex w-max animate-[hero-marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]">
            {[...MARQUEE, ...MARQUEE].map(([label, color], i) => (
                <span
                    key={i}
                    className="mr-3 inline-flex items-center gap-2.5 rounded-full border border-navy/10 bg-ivory/80 px-4 py-2 text-xs font-medium text-navy backdrop-blur"
                >
              <i className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  {label}
            </span>
            ))}
          </div>
        </div>
      </section>
  )
}