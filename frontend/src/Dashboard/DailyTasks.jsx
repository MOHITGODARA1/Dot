import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCheck, Circle, ClipboardList, LoaderCircle, LogOut, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { createTask, deleteTask, getDailyTasks, updateTask } from '../lib/tasks.js'

const PRIORITIES = ['Low', 'Medium', 'High']
const STATUSES = ['Pending', 'In Progress', 'Completed']

function localDateKey() {
  const today = new Date()
  return `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`
}

function shiftDate(value, amount) {
  const [year, month, day] = value.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, month - 1, day + amount))
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`
}

function formatDate(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day, 12)))
}

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?'
}

function Avatar({ person, size = 'h-10 w-10' }) {
  return person?.avatar ? (
    <img src={person.avatar} alt={person.name} referrerPolicy="no-referrer" className={`${size} rounded-full object-cover ring-2 ring-white`} />
  ) : (
    <div aria-label={person?.name} className={`${size} grid place-items-center rounded-full bg-[#DCE5EA] text-xs font-semibold text-navy ring-2 ring-white`}>{initials(person?.name)}</div>
  )
}

function taskSummary(tasks) {
  const completed = tasks.filter((task) => task.status === 'Completed').length
  const inProgress = tasks.filter((task) => task.status === 'In Progress').length
  const pending = tasks.length - completed - inProgress
  return { total: tasks.length, completed, inProgress, pending, percentage: tasks.length ? Math.round((completed / tasks.length) * 100) : 0 }
}

function SummaryCard({ person, summary, isMine }) {
  return (
    <article className="rounded-2xl border border-navy/10 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Avatar person={person} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{isMine ? 'My progress' : `${person.name.split(/\s+/)[0]}'s progress`}</p>
          <p className="mt-0.5 text-xs text-muted">{summary.completed} of {summary.total} completed</p>
        </div>
        <span className="text-lg font-semibold tabular-nums">{summary.percentage}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#DCE5EA]" role="progressbar" aria-valuenow={summary.percentage} aria-valuemin="0" aria-valuemax="100" aria-label={`${isMine ? 'My' : `${person.name}'s`} completion progress`}>
        <div className="h-full rounded-full bg-[#779787] transition-all" style={{ width: `${summary.percentage}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <span>{summary.total} total</span><span>{summary.pending} pending</span><span>{summary.inProgress} in progress</span>
      </div>
    </article>
  )
}

function TaskEditor({ initial, busy, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [priority, setPriority] = useState(initial?.priority || 'Medium')
  const [status, setStatus] = useState(initial?.status || 'Pending')

  function submit(event) {
    event.preventDefault()
    onSave({ title: title.trim(), description: description.trim(), priority, status })
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-navy/10 bg-ivory/70 p-4">
      <label className="grid gap-1.5 text-xs font-medium text-[#56636a]">
        Task title
        <input autoFocus required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What would you like to do?" className="rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-slate" />
      </label>
      <label className="grid gap-1.5 text-xs font-medium text-[#56636a]">
        Description <span className="font-normal text-muted">Optional</span>
        <textarea maxLength={500} rows={2} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a few details" className="resize-y rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-slate" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-xs font-medium text-[#56636a]">Priority
          <select value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-slate">
            {PRIORITIES.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-[#56636a]">Status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-slate">
            {STATUSES.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-muted hover:bg-white"><X size={14} /> Cancel</button>
        <button type="submit" disabled={busy || !title.trim()} className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-slate disabled:opacity-60">
          {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}{initial ? 'Save changes' : 'Add task'}
        </button>
      </div>
    </form>
  )
}

function TaskCard({ task, ownTask, busy, onStatusChange, onEdit, onDelete, onSaveEdit, onCancelEdit, editing }) {
  const priorityStyle = {
    Low: 'bg-[#DCE5EA]/70 text-[#526c7a]',
    Medium: 'bg-[#E8A87C]/15 text-[#96633f]',
    High: 'bg-[#b4533a]/10 text-[#963d2b]',
  }[task.priority]
  const statusStyle = task.status === 'Completed'
    ? 'bg-[#779787]/10 text-[#4f7363]'
    : task.status === 'In Progress'
      ? 'bg-[#DCE5EA]/70 text-[#526c7a]'
      : 'bg-[#F5F3EE] text-[#777F84]'

  return (
    <li className={`rounded-2xl border border-navy/8 bg-white p-4 ${task.status === 'Completed' ? 'opacity-80' : ''}`}>
      {editing ? (
        <TaskEditor initial={task} busy={busy} onSave={onSaveEdit} onCancel={onCancelEdit} />
      ) : (
        <>
          <div className="flex items-start gap-3">
            <label className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center" title={ownTask ? 'Mark completed' : task.status}>
              <input type="checkbox" checked={task.status === 'Completed'} disabled={!ownTask || busy} onChange={(event) => onStatusChange(event.target.checked ? 'Completed' : 'Pending')} aria-label={`${task.status === 'Completed' ? 'Reopen' : 'Complete'} task: ${task.title}`} className="peer sr-only" />
              <span className={`grid h-5 w-5 place-items-center rounded-full border transition ${task.status === 'Completed' ? 'border-[#779787] bg-[#779787] text-white' : 'border-navy/20 text-transparent'} ${ownTask ? 'peer-focus-visible:ring-2 peer-focus-visible:ring-slate/50 peer-enabled:cursor-pointer' : ''}`}>
                {task.status === 'Completed' ? <Check size={13} strokeWidth={3} /> : <Circle size={10} />}
              </span>
            </label>
            <div className="min-w-0 flex-1">
              <h4 className={`break-words text-sm font-semibold ${task.status === 'Completed' ? 'text-muted line-through' : 'text-navy'}`}>{task.title}</h4>
              {task.description && <p className="mt-1.5 whitespace-pre-wrap break-words text-xs leading-5 text-muted">{task.description}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${priorityStyle}`}>{task.priority}</span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle}`}>{task.status}</span>
                <span className="text-[10px] text-muted">Added {new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(task.createdAt))}</span>
                {task.completedAt && <span className="text-[10px] text-muted">· Completed {new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(task.completedAt))}</span>}
              </div>
            </div>
            {ownTask && (
              <div className="flex shrink-0 items-center gap-0.5">
                <button type="button" onClick={onEdit} disabled={busy} aria-label={`Edit ${task.title}`} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-ivory hover:text-navy"><Pencil size={14} /></button>
                <button type="button" onClick={onDelete} disabled={busy} aria-label={`Delete ${task.title}`} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-[#b4533a]/10 hover:text-[#963d2b]"><Trash2 size={14} /></button>
              </div>
            )}
          </div>
          {ownTask && <label className="sr-only">Update status for {task.title}<select value={task.status} onChange={(event) => onStatusChange(event.target.value)}><option>Pending</option><option>In Progress</option><option>Completed</option></select></label>}
        </>
      )}
    </li>
  )
}

function TaskSection({ person, tasks, isMine, onStatusChange, onEdit, onDelete, onSaveEdit, onCancelEdit, editingId, busyId, adding, onStartAdd, onCancelAdd, onCreate }) {
  return (
    <section className="rounded-2xl border border-navy/10 bg-[#FAF9F6] p-4 sm:p-5" aria-label={`${isMine ? 'My' : `${person.name}'s`} tasks`}>
      <div className="flex items-center gap-3">
        <Avatar person={person} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-serif text-xl">{isMine ? 'My Tasks' : `${person.name.split(/\s+/)[0]}'s Tasks`}</h3>
          <p className="mt-0.5 text-xs text-muted">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} for this day</p>
        </div>
        {isMine && !adding && <button type="button" onClick={onStartAdd} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-navy px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate"><Plus size={14} /> Add task</button>}
      </div>

      {isMine && adding && <TaskEditor busy={busyId === 'new'} onSave={onCreate} onCancel={onCancelAdd} />}
      {tasks.length ? (
        <ul className="mt-4 grid list-none gap-2.5 p-0">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              ownTask={isMine}
              busy={busyId === task._id}
              editing={editingId === task._id}
              onStatusChange={(status) => onStatusChange(task, status)}
              onEdit={() => onEdit(task._id)}
              onDelete={() => onDelete(task)}
              onSaveEdit={(values) => onSaveEdit(task, values)}
              onCancelEdit={onCancelEdit}
            />
          ))}
        </ul>
      ) : (
        !adding && <div className="mt-4 rounded-xl border border-dashed border-navy/15 bg-white/70 px-4 py-7 text-center">
          <ClipboardList className="mx-auto text-[#9BAFBC]" size={22} />
          <p className="mt-2 text-sm font-medium">{isMine ? 'No tasks added yet' : 'No tasks from your partner yet'}</p>
          <p className="mt-1 text-xs text-muted">{isMine ? 'Add a task to start planning your day.' : 'Their tasks will show here when they add some.'}</p>
        </div>
      )}
    </section>
  )
}

export default function DailyTasks({ user, partner, refreshToken, onLogout }) {
  const [taskDate, setTaskDate] = useState('')
  const [todayDate, setTodayDate] = useState('')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const loadTasks = useCallback(async (showLoading = false) => {
    if (!taskDate) return
    if (showLoading) setLoading(true)
    try {
      const result = await getDailyTasks(taskDate)
      setTasks(result.tasks)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [taskDate])

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      const today = localDateKey()
      setTodayDate(today)
      setTaskDate(today)
    }, 0)
    const refreshToday = window.setInterval(() => setTodayDate(localDateKey()), 60000)
    return () => {
      window.clearTimeout(initialize)
      window.clearInterval(refreshToday)
    }
  }, [])

  useEffect(() => {
    if (!taskDate) return undefined
    const initialLoad = window.setTimeout(() => loadTasks(true), 0)
    return () => window.clearTimeout(initialLoad)
  }, [taskDate, refreshToken, loadTasks])

  useEffect(() => {
    if (!taskDate) return undefined
    const interval = window.setInterval(() => loadTasks(), 20000)
    return () => window.clearInterval(interval)
  }, [taskDate, loadTasks])

  const ownTasks = useMemo(() => tasks.filter((task) => String(task.userId) === String(user.id)), [tasks, user.id])
  const partnerTasks = useMemo(() => tasks.filter((task) => String(task.userId) !== String(user.id)), [tasks, user.id])
  const mySummary = useMemo(() => taskSummary(ownTasks), [ownTasks])
  const partnerSummary = useMemo(() => taskSummary(partnerTasks), [partnerTasks])
  const totalSummary = useMemo(() => taskSummary(tasks), [tasks])
  const isToday = Boolean(taskDate && taskDate === todayDate)

  async function create(values) {
    setBusyId('new')
    try {
      await createTask({ ...values, taskDate })
      setAdding(false)
      await loadTasks()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  async function save(task, values) {
    setBusyId(task._id)
    try {
      await updateTask(task._id, values)
      setEditingId(null)
      await loadTasks()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  async function changeStatus(task, status) {
    setBusyId(task._id)
    try {
      await updateTask(task._id, { status })
      await loadTasks()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  async function remove(task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return
    setBusyId(task._id)
    try {
      await deleteTask(task._id)
      await loadTasks()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  function changeDay(amount) {
    setEditingId(null)
    setAdding(false)
    setError('')
    setTaskDate((current) => shiftDate(current, amount))
  }

  return (
    <main className="min-h-screen bg-ivory px-4 pb-12 pt-5 text-navy sm:px-8 sm:pt-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <a href="/" aria-label="Dot home"><img src="/logo.png" alt="Dot" className="h-8 w-auto" /></a>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2" aria-label={`Connected: ${user.name} and ${partner.name}`}><Avatar person={user} /><Avatar person={partner} /></div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#779787]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#4f7363]"><span className="h-1.5 w-1.5 rounded-full bg-[#779787]" /> Connected</span>
            <button type="button" onClick={onLogout} aria-label="Log out" className="ml-1 grid h-10 w-10 place-items-center rounded-full border border-navy/15 bg-white/70 transition hover:bg-white"><LogOut size={17} /></button>
          </div>
        </header>

        <section className="mt-8 flex flex-col gap-5 sm:mt-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#779787]">A little progress, together</p>
            <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Your day, together.</h1>
            <p className="mt-2 text-sm text-muted">Plan your day and follow each other’s progress.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-1 rounded-full border border-navy/10 bg-white p-1">
            <button type="button" onClick={() => changeDay(-1)} aria-label="Previous day" className="grid h-9 w-9 place-items-center rounded-full hover:bg-ivory"><ArrowLeft size={16} /></button>
            <span className="min-w-32 px-2 text-center text-xs font-semibold">{isToday ? 'Today · UTC' : taskDate ? formatDate(taskDate) : 'Loading date'}</span>
            <button type="button" onClick={() => changeDay(1)} aria-label="Next day" disabled={!taskDate} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ivory disabled:opacity-40"><ArrowRight size={16} /></button>
            {!isToday && <button type="button" onClick={() => { setAdding(false); setEditingId(null); setTaskDate(todayDate) }} className="rounded-full bg-[#DCE5EA]/60 px-3 py-2 text-[11px] font-semibold hover:bg-[#DCE5EA]">Today</button>}
          </div>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-3" aria-label="Daily progress">
          <SummaryCard person={user} summary={mySummary} isMine />
          <SummaryCard person={partner} summary={partnerSummary} />
          <article className="flex items-center gap-4 rounded-2xl border border-navy/10 bg-[#E8EDE8] p-4 sm:p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-[#779787]"><CheckCheck size={19} /></span>
            <div><p className="text-sm font-semibold">Shared today</p><p className="mt-1 text-xs text-muted">{totalSummary.total} tasks · {totalSummary.completed} completed · {totalSummary.pending} pending</p></div>
          </article>
        </section>

        {error && <div role="alert" className="mt-5 flex items-center gap-2 rounded-xl border border-[#b4533a]/20 bg-[#b4533a]/8 px-4 py-3 text-sm text-[#963d2b]">{error}<button type="button" onClick={() => setError('')} className="ml-auto font-semibold">Dismiss</button></div>}

        {loading && !tasks.length ? (
          <div className="mt-6 grid min-h-52 place-items-center rounded-2xl border border-navy/10 bg-white"><LoaderCircle className="animate-spin text-slate" size={25} /></div>
        ) : (
          <>
            {tasks.length === 0 && !adding && <p className="mt-6 rounded-2xl border border-dashed border-navy/15 bg-white/60 px-5 py-6 text-center text-sm text-muted">Nothing planned yet. Add your first task and start today together.</p>}
            <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">
              <TaskSection
                person={user} tasks={ownTasks} isMine adding={adding} onStartAdd={() => { setAdding(true); setError('') }} onCancelAdd={() => setAdding(false)} onCreate={create}
                busyId={busyId} editingId={editingId} onStatusChange={changeStatus} onEdit={setEditingId} onDelete={remove}
                onSaveEdit={save} onCancelEdit={() => setEditingId(null)}
              />
              <TaskSection person={partner} tasks={partnerTasks} isMine={false} />
            </div>
          </>
        )}

        <footer className="mt-6 flex items-center justify-between text-xs text-muted"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> Shared calendar dates use UTC</span><span>Only you can edit your tasks</span></footer>
      </div>
    </main>
  )
}
