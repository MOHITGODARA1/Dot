import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Same accent colors as the rest of the site
const SAGE = '#779787'
const APRICOT = '#E8A87C'
const LILAC = '#B3A7D6'

const focusRing =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate'

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
    )
}

/**
 * Login pop-up.
 *
 * Props
 *  - open:          boolean, show or hide the pop-up
 *  - onClose:       called when the user closes it (X button, backdrop click, Escape)
 *  - onGoogleLogin: optional async function that signs the user in with Google.
 *                   If it throws, an error message is shown. If it succeeds, the pop-up closes.
 */
export default function Login({ open, onClose, onGoogleLogin, initialError = '' }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(initialError)

    const dialogRef = useRef(null)
    const lastFocus = useRef(null)
    const closeRef = useRef(onClose)
    useEffect(() => { closeRef.current = onClose }, [onClose])

    // Reset form state after the close transition completes.
    useEffect(() => {
        if (open) return
        const t = setTimeout(() => {
            setLoading(false)
            setError('')
        }, 250)
        return () => clearTimeout(t)
    }, [open])

    const handleGoogle = async () => {
        setError('')
        setLoading(true)
        try {
            if (onGoogleLogin) await onGoogleLogin()
            else console.log('Google login clicked: pass an onGoogleLogin function to <Login />')
            // Redirect flows leave the page; only close for non-redirect handlers.
            closeRef.current()
        } catch (err) {
            console.error(err)
            setError("We couldn't connect to Google. Please try again.")
            setLoading(false)
        }
    }
    // Escape to close, keep Tab inside the pop-up, lock page scroll, restore focus on close
    useEffect(() => {
        if (!open) return
        lastFocus.current = document.activeElement
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        const onKey = (e) => {
            if (e.key === 'Escape') {
                closeRef.current()
                return
            }
            if (e.key !== 'Tab' || !dialogRef.current) return
            const items = [...dialogRef.current.querySelectorAll('button, input, a[href]')].filter((el) => !el.disabled)
            if (!items.length) return
            const first = items[0]
            const last = items[items.length - 1]
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first.focus()
            }
        }

        window.addEventListener('keydown', onKey)
        const t = setTimeout(() => dialogRef.current?.querySelector('[data-autofocus]')?.focus(), 60)

        return () => {
            clearTimeout(t)
            window.removeEventListener('keydown', onKey)
            document.body.style.overflow = prevOverflow
            lastFocus.current?.focus?.()
        }
    }, [open])

    if (!open) return null

    return createPortal(
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 sm:p-5">
            <style>{`
        @keyframes login-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes login-fade-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes login-pop-in { from { opacity: 0; transform: translateY(18px) scale(.96); } to { opacity: 1; transform: none; } }
        @keyframes login-pop-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(12px) scale(.97); } }
        @keyframes login-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes login-swap { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .login-fade-in { animation: login-fade-in .25s ease-out both; }
        .login-fade-out { animation: login-fade-out .25s ease-in both; }
        .login-pop-in { animation: login-pop-in .4s cubic-bezier(.22,1,.36,1) both; }
        .login-pop-out { animation: login-pop-out .25s ease-in both; }
        .login-bounce { animation: login-bounce 1.4s ease-in-out infinite; }
        .login-swap { animation: login-swap .35s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .login-fade-in, .login-fade-out, .login-pop-in, .login-pop-out, .login-bounce, .login-swap { animation: none; }
        }
      `}</style>

            {/* Backdrop */}
            <div
                aria-hidden="true"
                onClick={() => closeRef.current()}
                className={`absolute inset-0 bg-navy/40 backdrop-blur-sm ${open ? 'login-fade-in' : 'login-fade-out'}`}
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-title"
                className={`relative my-auto w-full max-w-[420px] rounded-3xl border border-navy/10 bg-ivory p-6 shadow-[0_40px_80px_-30px] shadow-navy/50 sm:p-9 ${
                    open ? 'login-pop-in' : 'login-pop-out'
                }`}
            >
                <button
                    type="button"
                    onClick={() => closeRef.current()}
                    aria-label="Close"
                    className={`absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-slate transition-colors duration-200 hover:bg-navy/5 ${focusRing}`}
                >
                    <X size={18} />
                </button>

                <div className="flex flex-col items-center text-center">
                    {/* Three bouncing dots in the accent colors */}
                    <div className="mb-5 flex items-center gap-2" aria-hidden="true">
                        {[SAGE, APRICOT, LILAC].map((c, i) => (
                            <i key={c} className="login-bounce block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c, animationDelay: `${i * 0.18}s` }} />
                        ))}
                    </div>

                    <img src="/logo.png" alt="Dot" className="mb-4 h-9 w-auto" />

                    <h2 id="login-title" className="m-0 font-serif text-[32px] leading-[1.1] tracking-[-0.02em] text-navy">
                        Welcome back.
                    </h2>
                    <p className="mb-7 mt-2 max-w-[300px] text-sm leading-[1.7] text-muted">
                        Log in to pick up where your days left off.
                    </p>
                </div>

                {/* Google */}
                <button
                    type="button"
                    data-autofocus
                    onClick={handleGoogle}
                    disabled={loading}
                    className={`flex w-full items-center justify-center gap-3 rounded-full border border-navy/15 bg-white px-5 py-3.5 text-[13px] font-semibold text-navy transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-16px] hover:shadow-navy/40 active:translate-y-0 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none ${focusRing}`}
                >
                    {loading ? (
                        <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
                            Connecting…
                        </>
                    ) : (
                        <>
                            <GoogleIcon />
                            Continue with Google
                        </>
                    )}
                </button>

                {error && (
                    <p role="alert" className="login-swap m-0 mt-3 text-center text-xs text-[#b4533a]">
                        {error}
                    </p>
                )}

                <p className="m-0 mt-6 text-center text-[11px] leading-[1.6] text-muted">
                    By continuing, you agree to our Terms and Privacy Policy.
                </p>
            </div>
        </div>,
        document.body
    )
}
