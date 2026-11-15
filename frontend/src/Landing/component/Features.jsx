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

const AUTOPLAY_SECONDS = 7

const features = [
    {
        id: 'live',
        number: '01',
        tag: 'Live presence',
        icon: Activity,
        title: "See what they're up to.",
        text: "Share your current activity and let your partner see what you're doing in real time.",
        color: SAGE,
    },
    {
        id: 'time',
        number: '02',
        tag: 'Time tracking',
        icon: Clock3,
        title: 'Every minute matters.',
        text: 'Start an activity, track the time you spend and keep a record of your everyday progress.',
        color: LILAC,
    },
    {
        id: 'habits',
        number: '03',
        tag: 'Shared routines',
        icon: CalendarDays,
        title: 'Build routines together.',
        text: "Create recurring habits, plan your routines and stay consistent with each other's support.",
        color: APRICOT,
    },
    {
        id: 'moments',
        number: '04',
        tag: 'Little moments',
        icon: MessageCircleHeart,
        title: 'Stay connected throughout the day.',
        text: 'See activity updates, celebrate small achievements and encourage each other.',
        color: SAGE,
    },
]

// Floating dots inside the stage: [top, left, size, color, duration, delay]
const DOTS = [
    ['12%', '8%', 10, SAGE, '6s', '0s'],
    ['24%', '90%', 14, APRICOT, '7s', '1s'],
    ['76%', '6%', 12, LILAC, '8s', '.5s'],
    ['86%', '86%', 9, SAGE, '6.5s', '1.5s'],
    ['50%', '95%', 8, LILAC, '7.5s', '2s'],
    ['62%', '3%', 7, APRICOT, '9s', '.8s'],
]

const pad = (n) => String(n).padStart(2, '0')

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

/* ---------- illustrations (shown in the stage) ---------- */

function LiveIllustration({ color }) {
    const [s, setS] = useState(32 * 60 + 7)
    useEffect(() => {
        const id = setInterval(() => setS((v) => v + 1), 1000)
        return () => clearInterval(id)
    }, [])

    return (
        <div className="w-full max-w-[340px] space-y-2.5">
            <div className={`${miniCard} flex items-center gap-3.5`}>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-navy" style={{ backgroundColor: `${color}40` }}>
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
                <div className="flex h-8 items-end gap-[3px]" aria-hidden="true">
                    {[0.2, 0.55, 0.1, 0.75, 0.35].map((d, i) => (
                        <i key={i} className="f-eq block h-full w-[3px] origin-bottom rounded-full" style={{ backgroundColor: color, animationDelay: `${d}s` }} />
                    ))}
                </div>
            </div>

            <div className="ml-6 flex w-fit items-center gap-2.5 rounded-full bg-white/90 py-1.5 pl-1.5 pr-4 text-[11px] text-slate shadow-[0_10px_24px_-16px] shadow-navy/40">
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

    return (
        <div className={`${miniCard} w-full max-w-[310px] px-5 py-4`}>
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
                    className={`grid h-10 w-10 place-items-center rounded-full text-navy transition duration-300 hover:scale-105 active:scale-90 ${focusRing}`}
                    style={{ backgroundColor: `${color}55` }}
                >
                    {running ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                </button>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-navy/10">
                <div
                    className="h-full rounded-full transition-[width] duration-1000 ease-linear"
                    style={{ width: `${(sec / 3600) * 100}%`, backgroundColor: color }}
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
        <div className={`${miniCard} w-full max-w-[330px]`}>
            <div className="mb-2 flex items-center justify-between">
                <b className="font-serif text-lg text-navy">Our rhythm</b>
                <span className="rounded-full bg-soft px-2.5 py-1 text-[11px] font-medium tabular-nums text-slate">{count}/3 today</span>
            </div>
            {HABITS.map((h, i) => (
                <button
                    key={h.label}
                    type="button"
                    onClick={() => setDone((d) => d.map((v, idx) => (idx === i ? !v : v)))}
                    aria-pressed={done[i]}
                    className={`flex w-full items-center gap-3 rounded-xl border-t border-navy/5 px-1 py-2.5 text-left text-[13px] text-navy transition-colors duration-200 first:border-t-0 hover:bg-soft/60 ${focusRing}`}
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
            prev.map((it, idx) => (idx === i ? { ...it, liked: !it.liked, count: it.count + (it.liked ? -1 : 1) } : it))
        )

    return (
        <div className={`${miniCard} w-full max-w-[360px] px-4 py-2`}>
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
                            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] tabular-nums transition-colors duration-200 hover:bg-soft ${focusRing}`}
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

/* ---------- left list ---------- */

function FeatureRow({ feature, index, active, seen, paused, onSelect, onDone }) {
    const on = index === active
    const Icon = feature.icon

    return (
        <div
            className={`f-rise ${seen ? 'in' : ''} rounded-3xl border transition-[background-color,border-color,box-shadow] duration-500 ${
                on ? 'border-navy/10 bg-soft shadow-[0_24px_44px_-28px] shadow-navy/40' : 'border-transparent hover:bg-soft/50'
            }`}
            style={{ '--d': `${250 + index * 120}ms` }}
        >
            <h3 className="m-0">
                <button
                    type="button"
                    onClick={() => onSelect(index)}
                    aria-expanded={on}
                    aria-controls={`feature-${feature.id}`}
                    className={`flex w-full items-center gap-4 rounded-3xl p-4 text-left ${focusRing}`}
                >
          <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
              style={{ backgroundColor: on ? `${feature.color}66` : 'rgba(41,61,74,.06)', transform: on ? 'scale(1.08) rotate(-6deg)' : 'none' }}
          >
            <Icon size={19} />
          </span>
                    <span className="flex-1">
            <span className="block text-[11px] tracking-widest text-muted">{feature.number}</span>
            <span className={`block font-serif text-xl transition-colors duration-300 sm:text-2xl ${on ? 'text-navy' : 'text-[#5f6b70]'}`}>
              {feature.title}
            </span>
          </span>
                </button>
            </h3>

            <div
                id={`feature-${feature.id}`}
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="min-h-0 overflow-hidden">
                    <div className="px-4 pb-5 sm:pl-[76px]">
                        <p className="m-0 max-w-[380px] text-[13px] leading-[1.75] text-[#5f6b70] sm:text-sm">{feature.text}</p>
                        {/* Autoplay progress: when it finishes, the next feature opens */}
                        <div className="mt-4 h-[3px] overflow-hidden rounded-full bg-navy/10">
                            {on && seen && (
                                <div
                                    className="f-progress h-full origin-left rounded-full"
                                    style={{
                                        backgroundColor: feature.color,
                                        animationDuration: `${AUTOPLAY_SECONDS}s`,
                                        animationPlayState: paused ? 'paused' : 'running',
                                    }}
                                    onAnimationEnd={(e) => e.animationName === 'f-progress' && onDone()}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ---------- section ---------- */

export default function Features() {
    const reduced = useReducedMotion()
    const [headRef, headSeen] = useInView()
    const [showRef, showSeen] = useInView()
    const [active, setActive] = useState(0)
    const [hover, setHover] = useState(false)
    const [focus, setFocus] = useState(false)
    const tiltRef = useRef(null)

    const paused = hover || focus
    const next = () => setActive((i) => (i + 1) % features.length)
    const current = features[active]
    const secondary = features[(active + 1) % features.length].color

    // 3D tilt on the stage (mouse only)
    const onStageMove = (e) => {
        if (reduced || e.pointerType !== 'mouse' || !tiltRef.current) return
        const el = tiltRef.current
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        el.style.transform = `perspective(1200px) rotateX(${-py * 5}deg) rotateY(${px * 6}deg)`
    }
    const onStageLeave = () => {
        if (tiltRef.current) tiltRef.current.style.transform = 'perspective(1200px)'
    }

    return (
        <section id="features" className="relative isolate overflow-hidden py-20 md:py-28">
            <style>{`
        .f-rise { opacity: 0; transform: translateY(28px); filter: blur(6px);
          transition: opacity .8s cubic-bezier(.22,1,.36,1) var(--d,0ms), transform .8s cubic-bezier(.22,1,.36,1) var(--d,0ms), filter .8s cubic-bezier(.22,1,.36,1) var(--d,0ms), background-color .5s, border-color .5s, box-shadow .5s; }
        .f-rise.in { opacity: 1; transform: none; filter: blur(0); }
        @keyframes f-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes f-swap { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes f-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes f-eq { 0%, 100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
        @keyframes f-pop { 0% { transform: scale(1); } 40% { transform: scale(1.5); } 100% { transform: scale(1); } }
        @keyframes f-dot { 0%, 80%, 100% { transform: translateY(0); opacity: .5; } 40% { transform: translateY(-4px); opacity: 1; } }
        .f-progress { animation-name: f-progress; animation-timing-function: linear; animation-fill-mode: forwards; }
        .f-swap { animation: f-swap .6s cubic-bezier(.22,1,.36,1) both; }
        .f-float { animation: f-float 7s ease-in-out infinite; }
        .f-eq { animation: f-eq 1s ease-in-out infinite; }
        .f-pop { animation: f-pop .45s cubic-bezier(.22,1,.36,1); }
        .f-dot { animation: f-dot 1.1s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .f-rise { opacity: 1; transform: none; filter: none; transition: none; }
          .f-progress { animation: none; }
          .f-swap, .f-float, .f-eq, .f-pop, .f-dot { animation: none; }
        }
      `}</style>

            {/* Background: flat pale shapes + a plain dot grid */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -left-24 top-32 h-[280px] w-[280px] rounded-full bg-[#779787]/10 sm:h-[340px] sm:w-[340px]" />
                <div className="absolute -right-20 top-[48%] h-[260px] w-[260px] rounded-full bg-[#E8A87C]/10 sm:h-[320px] sm:w-[320px]" />
                <div className="absolute -bottom-24 left-1/2 h-[240px] w-[240px] -translate-x-1/2 rounded-full bg-[#B3A7D6]/10" />
                <div className="absolute inset-0 text-navy/[0.12] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <div className="mx-auto w-[calc(100%-40px)] md:w-[min(1160px,calc(100%-64px))]">
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

                {/* Showcase: feature list + live stage */}
                <div
                    ref={showRef}
                    onPointerEnter={() => setHover(true)}
                    onPointerLeave={() => setHover(false)}
                    onFocusCapture={() => setFocus(true)}
                    onBlurCapture={() => setFocus(false)}
                    className="grid items-center gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10"
                >
                    {/* List (below the stage on small screens) */}
                    <div className="order-2 space-y-2 lg:order-1">
                        {features.map((f, i) => (
                            <FeatureRow
                                key={f.id}
                                feature={f}
                                index={i}
                                active={active}
                                seen={showSeen}
                                paused={paused}
                                onSelect={setActive}
                                onDone={next}
                            />
                        ))}
                    </div>

                    {/* Stage */}
                    <div className={`f-rise ${showSeen ? 'in' : ''} order-1 lg:order-2`} style={{ '--d': '300ms' }}>
                        <div
                            ref={tiltRef}
                            onPointerMove={onStageMove}
                            onPointerLeave={onStageLeave}
                            className="group relative h-[430px] overflow-hidden rounded-[2rem] border border-navy/5 bg-soft shadow-[0_40px_80px_-44px] shadow-navy/40 transition-transform duration-300 ease-out sm:h-[470px] lg:h-[580px]"
                            style={{ transform: 'perspective(1200px)' }}
                        >
                            {/* Flat shapes that take the active feature's color */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full transition-colors duration-700"
                                style={{ backgroundColor: `${current.color}55` }}
                            />
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full transition-colors duration-700"
                                style={{ backgroundColor: `${secondary}33` }}
                            />
                            <div className="pointer-events-none absolute inset-0 text-navy/10 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px]" />

                            {/* Giant number */}
                            <span
                                key={`num-${active}`}
                                aria-hidden="true"
                                className="f-swap pointer-events-none absolute -bottom-8 -left-3 select-none font-serif text-[180px] leading-none text-navy/[0.06] sm:text-[220px]"
                            >
                {current.number}
              </span>

                            {/* Floating dots */}
                            {DOTS.map(([top, left, size, color, dur, delay], i) => (
                                <i
                                    key={i}
                                    aria-hidden="true"
                                    className="f-float pointer-events-none absolute rounded-full opacity-80"
                                    style={{ top, left, width: size, height: size, backgroundColor: color, animationDuration: dur, animationDelay: delay }}
                                />
                            ))}

                            {/* Illustrations: all stay mounted, the active one fades in */}
                            {features.map((f, i) => {
                                const on = i === active
                                const Illustration = ILLUSTRATIONS[f.id]
                                return (
                                    <div
                                        key={f.id}
                                        aria-hidden={!on}
                                        className="absolute inset-0 z-10 flex items-center justify-center p-5"
                                        style={{
                                            opacity: on ? 1 : 0,
                                            transform: on ? 'none' : 'scale(.92) translateY(18px)',
                                            filter: on ? 'blur(0)' : 'blur(10px)',
                                            visibility: on ? 'visible' : 'hidden',
                                            transition: `opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1), filter .7s cubic-bezier(.22,1,.36,1), visibility 0s linear ${on ? '0s' : '.7s'}`,
                                        }}
                                    >
                                        <div className="flex w-full justify-center sm:scale-110 lg:scale-125">
                                            <Illustration color={f.color} />
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Top bar */}
                            <div className="absolute inset-x-5 top-5 z-20 flex items-center justify-between">
                <span
                    key={`tag-${active}`}
                    className="f-swap inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-medium text-slate shadow-[0_8px_20px_-14px] shadow-navy/40 backdrop-blur"
                >
                  <i className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: current.color, boxShadow: `0 0 0 4px ${current.color}33` }} />
                    {current.tag}
                </span>
                                <span className="text-[11px] tabular-nums tracking-widest text-muted">
                  {current.number} / {pad(features.length)}
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}