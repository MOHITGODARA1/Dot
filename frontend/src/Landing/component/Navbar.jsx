import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import Brand from './Brand.jsx'

const links = [
  ['Home', '#home'],
  ['Features', '#features'],
  ['How It Works', '#how-it-works'],
  ['About', '#about'],
]

const focusRing =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [active, setActive] = useState('#home')
  const [hovered, setHovered] = useState(null)
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false })

  const itemRefs = useRef([])
  const progressRef = useRef(null)
  const lastY = useRef(0)

  const activeIndex = links.findIndex(([, href]) => href === active)
  const target = hovered ?? activeIndex

  // Scroll: compact floating bar, hide on scroll down / show on scroll up, reading progress
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrolled(y > 12)

      if (Math.abs(y - lastY.current) > 6) {
        setHidden(y > lastY.current && y > 160)
        lastY.current = y
      }

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Highlight the link for the section currently in view
  useEffect(() => {
    const sections = links.map(([, href]) => document.querySelector(href)).filter(Boolean)
    if (!sections.length) return
    const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActive('#' + e.target.id)
          })
        },
        { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  // Sliding pill: measure the target link (hovered link, otherwise the active one)
  const measure = useCallback(() => {
    const el = itemRefs.current[target]
    if (!el) {
      setPill((p) => ({ ...p, ready: false }))
      return
    }
    setPill({ left: el.offsetLeft, width: el.offsetWidth, ready: true })
  }, [target])

  useLayoutEffect(measure, [measure])

  useEffect(() => {
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  // Mobile menu: Escape to close, lock page scroll, close when resized to desktop
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const mq = window.matchMedia('(min-width: 768px)')
    const onResize = (e) => e.matches && setOpen(false)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    mq.addEventListener('change', onResize)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onResize)
    }
  }, [open])

  // Cursor-following spotlight on the CTA
  const onSpotlight = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
  }

  const visible = !hidden || open

  return (
      <>
        <style>{`
        html { scroll-behavior: smooth; scroll-padding-top: 96px; }
        @keyframes nav-enter {
          from { opacity: 0; transform: translateY(-16px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .nav-enter { animation: nav-enter .8s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .nav-enter { animation: none; }
          header, header * { transition-duration: 0.01ms !important; transition-delay: 0ms !important; }
        }
      `}</style>

        <header
            onFocus={() => setHidden(false)}
            className={`fixed inset-x-0 top-0 z-30 px-3 pt-3 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] md:px-6 md:pt-4 ${
                visible ? 'translate-y-0' : '-translate-y-[150%]'
            }`}
        >
          {/* Backdrop for the mobile menu */}
          <div
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className={`fixed inset-0 -z-10 bg-navy/25 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
                  open ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
          />

          <nav
              aria-label="Main navigation"
              className={`nav-enter relative mx-auto flex h-14 w-full  items-center justify-between rounded-full border pl-5 pr-2 backdrop-blur-xl transition-[max-width,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(.22,1,.36,1)] md:h-16 md:pl-6 md:pr-2.5 ${
                  
              scrolled
              ? 'max-w-[1000px] border-navy/10 bg-ivory/85 shadow-[0_18px_40px_-22px] shadow-navy/50'
              : 'max-w-[1280px] border-navy/5 bg-ivory/60 shadow-[0_12px_32px_-16px] shadow-navy/30'
              }`}
          >
            {/* Left: brand */}
            <a
                href="#home"
                onClick={() => setActive('#home')}
                aria-label="dot.today home"
                className={`shrink-0 rounded-full ${focusRing}`}
            >
              <img
                  src='./logo.png'
                  alt="dot logo"
                  className="h-7 w-auto md:h-13"
              />
            </a>

            {/* Center: links with a sliding highlight */}
            <div
                className="relative hidden items-center p-1 md:absolute md:left-1/2 md:flex md:-translate-x-1/2"
                onMouseLeave={() => setHovered(null)}
            >
            <span
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-1 left-0 top-1 rounded-full bg-navy/[0.07] transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
                    pill.ready ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ width: pill.width, transform: `translateX(${pill.left}px)` }}
            />
              {links.map(([label, href], i) => (
                  <a
                      key={label}
                      href={href}
                      ref={(el) => (itemRefs.current[i] = el)}
                      aria-current={active === href ? 'true' : undefined}
                      onClick={() => setActive(href)}
                      onMouseEnter={() => setHovered(i)}
                      onFocus={() => setHovered(i)}
                      onBlur={() => setHovered(null)}
                      className={`relative rounded-full px-4 py-2 text-xs transition-colors duration-200 ${focusRing} ${
                          target === i ? 'font-medium text-navy' : 'text-[#56636a]'
                      }`}
                  >
                    {label}
                  </a>
              ))}
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1.5 md:gap-2">


              <a
                  href="#about"
                  onMouseMove={onSpotlight}
                  className={`group relative hidden items-center gap-3 overflow-hidden rounded-full bg-navy py-1.5 pl-5 pr-1.5 text-xs font-semibold text-white transition-colors duration-300 hover:bg-navy sm:inline-flex ${focusRing}`}
              >
              <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                        'radial-gradient(110px circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,.28), transparent 70%)',
                  }}
              />
                <span className="relative text-white">Get Started</span>
                <span className="relative grid h-7 w-7 place-items-center rounded-full bg-ivory text-navy transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:rotate-45">
                <ArrowUpRight size={14} />
              </span>
              </a>

              {/* Hamburger (mobile) */}
              <button
                  className={`relative grid h-10 w-10 place-items-center rounded-full bg-navy/5 text-navy transition-colors duration-200 hover:bg-navy/10 md:hidden ${focusRing}`}
                  onClick={() => setOpen(!open)}
                  aria-label={open ? 'Close menu' : 'Open menu'}
                  aria-expanded={open}
                  aria-controls="mobile-menu"
              >
                <Menu
                    size={18}
                    className={`absolute transition-all duration-300 ${
                        open ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
                    }`}
                />
                <X
                    size={18}
                    className={`absolute transition-all duration-300 ${
                        open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
                    }`}
                />
              </button>
            </div>

            {/* Reading progress, tucked into the bottom edge of the bar */}
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-8 bottom-0 h-[2px] transition-opacity duration-300 ${
                    scrolled ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <div ref={progressRef} className="h-full origin-left scale-x-0 rounded-full bg-slate" />
            </div>
          </nav>

          {/* Mobile menu */}
          <div
              id="mobile-menu"
              aria-hidden={!open}
              className={`mx-auto mt-2 grid w-full max-w-[1280px] overflow-hidden rounded-3xl border border-navy/10 bg-ivory/95 backdrop-blur-xl transition-[grid-template-rows,opacity,box-shadow] duration-300 ease-out md:hidden ${
                  open
                      ? 'grid-rows-[1fr] opacity-100 shadow-[0_24px_50px_-24px] shadow-navy/50'
                      : 'pointer-events-none grid-rows-[0fr] border-transparent opacity-0'
              }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="flex flex-col p-3">
                {links.map(([label, href], i) => {
                  const isActive = active === href
                  return (
                      <a
                          key={label}
                          href={href}
                          tabIndex={open ? 0 : -1}
                          onClick={() => {
                            setActive(href)
                            setOpen(false)
                          }}
                          className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] transition-all duration-300 hover:bg-navy/5 ${focusRing} ${
                              isActive ? 'bg-navy/[0.06] font-medium text-navy' : 'text-[#56636a]'
                          } ${open ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}
                          style={{ transitionDelay: open ? `${80 + i * 50}ms` : '0ms' }}
                      >
                        {label}
                        <ArrowUpRight
                            size={16}
                            className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-30'}`}
                        />
                      </a>
                  )
                })}

                <div
                    className={`mt-2 flex gap-2 transition-all duration-300 ${
                        open ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                    }`}
                    style={{ transitionDelay: open ? `${80 + links.length * 50}ms` : '0ms' }}
                >
                  <a
                      href="mailto:hello@dot.today"
                      tabIndex={open ? 0 : -1}
                      onClick={() => setOpen(false)}
                      className={`flex-1 rounded-full border border-navy/15 py-3 text-center text-xs font-medium text-navy transition-colors duration-200 hover:bg-navy/5 ${focusRing}`}
                  >
                    Log In
                  </a>
                  <a
                      href="#about"
                      tabIndex={open ? 0 : -1}
                      onClick={() => setOpen(false)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-full bg-slate py-3 text-xs font-semibold text-white transition-colors duration-200 hover:bg-navy ${focusRing}`}
                  >
                    Get Started
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </header>
      </>
  )
}