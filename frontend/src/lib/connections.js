import { authenticatedFetch, getApiUrl } from './auth.js'

async function request(path, options = {}) {
  const response = await authenticatedFetch(`${getApiUrl()}/api/connections${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.message || 'Connection request failed. Please try again.')
  return result.data
}

export const getConnectionStatus = () => request('/me')
export const generateConnectionCode = () => request('/code', { method: 'POST' })
export const connectWithCode = (code) => request('/connect', { method: 'POST', body: JSON.stringify({ code }) })
