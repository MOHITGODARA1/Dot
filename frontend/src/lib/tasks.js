import { authenticatedFetch, getApiUrl } from './auth.js'

async function request(path, options = {}) {
  const response = await authenticatedFetch(`${getApiUrl()}/api/tasks${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.message || 'Could not load shared tasks. Please try again.')
  return result.data
}

export async function getDailyTasks(date) {
  const query = new URLSearchParams({ date })
  return request(`?${query}`)
}

export const createTask = (task) => request('/', { method: 'POST', body: JSON.stringify(task) })
export const updateTask = (taskId, task) => request(`/${encodeURIComponent(taskId)}`, { method: 'PATCH', body: JSON.stringify(task) })
export const deleteTask = (taskId) => request(`/${encodeURIComponent(taskId)}`, { method: 'DELETE' })
