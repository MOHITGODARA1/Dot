import { useCallback, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { Check, Clock3, Copy, Link2, LoaderCircle, LogOut, RefreshCw, ShieldCheck, Sparkles, Users } from 'lucide-react'
import DailyTasks from './DailyTasks.jsx'
import { getApiUrl, getValidAccessToken } from '../lib/auth.js'
import { connectWithCode, generateConnectionCode, getConnectionStatus } from '../lib/connections.js'

function formatRemaining(expiresAt, now) {
  const seconds = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export default function Dashboard({ user, onLogout }) {
  const [status, setStatus] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [notice, setNotice] = useState(null)
  const [now, setNow] = useState(0)
  const [taskRefreshToken, setTaskRefreshToken] = useState(0)

  const loadStatus = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoadingStatus(true)
    try {
      const nextStatus = await getConnectionStatus()
      setStatus(nextStatus)
    } catch (error) {
      setNotice({ type: 'error', message: error.message })
    } finally {
      setLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    const start = window.setTimeout(() => loadStatus(true), 0)
    const socket = io(getApiUrl(), {
      auth: (callback) => {
        getValidAccessToken()
          .then((token) => callback({ token }))
          .catch((error) => {
            if (error.status === 401) window.dispatchEvent(new Event('dot:auth-expired'))
            callback({ token: '' })
          })
      },
      transports: ['websocket', 'polling'],
    })
    socket.on('connection:updated', () => {
      loadStatus()
      setNotice({ type: 'success', message: 'You are successfully connected!' })
    })
    socket.on('tasks:updated', () => setTaskRefreshToken((current) => current + 1))
    // Polling keeps the dashboard current if a websocket cannot be established.
    const interval = window.setInterval(() => loadStatus(), 20000)
    const clock = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      socket.disconnect()
      window.clearTimeout(start)
      window.clearInterval(interval)
      window.clearInterval(clock)
    }
  }, [loadStatus])

  const remaining = useMemo(() => status?.status === 'waiting' ? formatRemaining(status.expiresAt, now) : '', [status, now])

  useEffect(() => {
    if (status?.status !== 'waiting' || remaining !== '0:00') return undefined
    const refresh = window.setTimeout(() => loadStatus(), 0)
    return () => window.clearTimeout(refresh)
  }, [status, remaining, loadStatus])

  async function handleGenerate() {
    setGenerating(true)
    setNotice(null)
    try {
      setStatus({ status: 'waiting', ...(await generateConnectionCode()) })
      setNotice({ type: 'success', message: 'Connection code ready. Share it with the person you want to connect with.' })
    } catch (error) {
      setNotice({ type: 'error', message: error.message })
      await loadStatus()
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(status.code)
      setNotice({ type: 'success', message: 'Connection code copied.' })
    } catch {
      setNotice({ type: 'error', message: 'Could not copy automatically. Select and copy the code.' })
    }
  }

  async function handleConnect(event) {
    event.preventDefault()
    setConnecting(true)
    setNotice(null)
    try {
      const connected = await connectWithCode(codeInput)
      setStatus(connected)
      setCodeInput('')
      setNotice({ type: 'success', message: 'You are successfully connected!' })
    } catch (error) {
      setNotice({ type: 'error', message: error.message })
    } finally {
      setConnecting(false)
    }
  }

  if (status?.status === 'connected') {
    return <DailyTasks user={user} partner={status.partner} refreshToken={taskRefreshToken} onLogout={onLogout} />
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there'

  return (
    <main className="min-h-screen bg-ivory px-4 pb-12 pt-5 text-navy sm:px-8 sm:pt-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <a href="/" aria-label="Dot home"><img src="/logo.png" alt="Dot" className="h-8 w-auto" /></a>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:block">{user?.name}</span>
            <button type="button" onClick={onLogout} aria-label="Log out" className="grid h-10 w-10 place-items-center rounded-full border border-navy/15 bg-white/70 transition hover:bg-white">
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-navy px-6 py-8 text-white shadow-[0_28px_70px_-38px] shadow-navy/50 sm:mt-12 sm:px-11 sm:py-11">
          <div aria-hidden="true" className="absolute -right-12 -top-28 h-80 w-80 rounded-full bg-[#779787]/30 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-40 right-1/3 h-64 w-64 rounded-full bg-[#E8A87C]/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/80"><Sparkles size={14} /> Your Dot space</span>
            <h1 className="mt-5 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Welcome, {firstName}.</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/70 sm:text-base">Build good habits and share the journey with someone important to you.</p>
          </div>
        </section>

        {notice && (
          <div role={notice.type === 'error' ? 'alert' : 'status'} className={`mt-5 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${notice.type === 'error' ? 'border-[#b4533a]/20 bg-[#b4533a]/8 text-[#963d2b]' : 'border-[#779787]/25 bg-[#779787]/10 text-[#405f52]'}`}>
            {notice.type === 'error' ? <ShieldCheck size={17} className="mt-0.5 shrink-0" /> : <Check size={17} className="mt-0.5 shrink-0" />}
            <span>{notice.message}</span>
            <button type="button" aria-label="Dismiss message" onClick={() => setNotice(null)} className="ml-auto text-current/60 hover:text-current">×</button>
          </div>
        )}

        {loadingStatus && !status ? (
          <section className="mt-6 grid min-h-64 place-items-center rounded-[1.75rem] border border-navy/10 bg-white"><LoaderCircle className="animate-spin text-slate" size={28} /></section>
        ) : (
          <section className="mt-6 grid gap-5 md:grid-cols-2">
            <article className="rounded-[1.75rem] border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#DCE5EA]/70 text-slate"><Link2 size={19} /></span>
              <h2 className="mt-5 font-serif text-2xl">Generate a code</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-muted">Create a one-time code and share it with the person you want to connect with.</p>

              {status?.status === 'waiting' ? (
                <div className="mt-6 rounded-2xl bg-ivory p-4">
                  <p className="text-xs font-medium uppercase tracking-[.12em] text-muted">Your connection code</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <output aria-label="Connection code" className="font-mono text-3xl font-semibold tracking-[.22em] sm:text-4xl">{status.code}</output>
                    <button type="button" onClick={handleCopy} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-navy/15 bg-white px-3 py-2 text-xs font-semibold transition hover:bg-[#DCE5EA]/50"><Copy size={14} /> Copy</button>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><Clock3 size={14} /> Expires in {remaining}. Share it before it expires.</p>
                  <p className="mt-1 text-xs leading-5 text-muted">Your code can be used once and is for the other person to enter in their account.</p>
                </div>
              ) : (
                <button type="button" disabled={generating || loadingStatus} onClick={handleGenerate} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate disabled:cursor-wait disabled:opacity-60">
                  {generating ? <><LoaderCircle size={17} className="animate-spin" /> Generating…</> : 'Generate Code'}
                </button>
              )}
            </article>

            <article className="rounded-[1.75rem] border border-navy/10 bg-[#E8EDE8] p-6 sm:p-8">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#779787]"><Users size={19} /></span>
              <h2 className="mt-5 font-serif text-2xl">Enter a code</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-[#56636a]">Have a code from someone? Enter it below to connect your accounts.</p>
              <form onSubmit={handleConnect} className="mt-6">
                <label htmlFor="connection-code" className="sr-only">Connection code</label>
                <input
                  id="connection-code"
                  name="code"
                  value={codeInput}
                  onChange={(event) => setCodeInput(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                  placeholder="6-character code"
                  autoComplete="off"
                  maxLength={6}
                  required
                  className="w-full rounded-2xl border border-navy/15 bg-white px-4 py-3.5 font-mono text-lg tracking-[.16em] text-navy outline-none transition placeholder:font-sans placeholder:text-sm placeholder:tracking-normal focus:border-slate focus:ring-2 focus:ring-slate/15"
                />
                <button type="submit" disabled={connecting || codeInput.length !== 6} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:opacity-50">
                  {connecting ? <><LoaderCircle size={17} className="animate-spin" /> Connecting…</> : 'Connect'}
                </button>
              </form>
            </article>
          </section>
        )}

        <footer className="mt-7 flex items-center justify-between text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} /> Your connection is private</span>
          <button type="button" onClick={() => loadStatus(true)} disabled={loadingStatus} className="inline-flex items-center gap-1.5 hover:text-navy disabled:opacity-50"><RefreshCw size={13} className={loadingStatus ? 'animate-spin' : ''} /> Refresh</button>
        </footer>
      </div>
    </main>
  )
}
