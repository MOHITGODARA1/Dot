const LEGACY_TOKEN_KEY = 'dot_token'
const LEGACY_USER_KEY = 'dot_user'

let accessToken = null
let accessTokenExpiresAt = 0
let refreshRequest = null
const authChannel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('dot-auth-session')

function clearLegacyStorage() {
  try {
    window.localStorage.removeItem(LEGACY_TOKEN_KEY)
    window.localStorage.removeItem(LEGACY_USER_KEY)
    window.sessionStorage.removeItem(LEGACY_TOKEN_KEY)
    window.sessionStorage.removeItem(LEGACY_USER_KEY)
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }
}

clearLegacyStorage()

if (authChannel) {
  authChannel.onmessage = ({ data }) => {
    if (data?.type === 'access-token' && data.token) {
      rememberAccessToken(data.token)
    } else if (data?.type === 'logout') {
      clearSession(false)
      window.dispatchEvent(new Event('dot:auth-expired'))
    }
  }
}

export function getApiUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:8080'
}

export function getToken() {
  return accessToken
}

function rememberAccessToken(token) {
  accessToken = token
  try {
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')))
    accessTokenExpiresAt = (payload.exp || 0) * 1000
  } catch {
    accessTokenExpiresAt = 0
  }
}

export function setSession({ accessToken: token }) {
  if (token) {
    rememberAccessToken(token)
    authChannel?.postMessage({ type: 'access-token', token })
  }
}

export function clearSession(broadcast = true) {
  accessToken = null
  accessTokenExpiresAt = 0
  clearLegacyStorage()
  if (broadcast) authChannel?.postMessage({ type: 'logout' })
}

function announceSessionExpired() {
  clearSession()
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('dot:auth-expired'))
}

async function requestRefresh() {
  const response = await fetch(`${getApiUrl()}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Dot-CSRF': '1',
    },
    body: '{}',
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(result.message || 'Could not refresh your session')
    error.status = response.status
    throw error
  }
  setSession(result.data)
  return result.data
}

export function refreshAccessToken() {
  if (!refreshRequest) {
    const refresh = async () => {
      if (typeof navigator !== 'undefined' && navigator.locks?.request) {
        return navigator.locks.request('dot-auth-refresh-session', async () => {
          if (accessToken && accessTokenExpiresAt > Date.now() + 30_000) return { accessToken }
          return requestRefresh()
        })
      }
      return requestRefresh()
    }
    refreshRequest = refresh().finally(() => {
      refreshRequest = null
    })
  }
  return refreshRequest
}

export async function getValidAccessToken() {
  if (accessToken && accessTokenExpiresAt > Date.now() + 30_000) return accessToken
  const session = await refreshAccessToken()
  return session.accessToken
}

function withBearer(options, token) {
  return {
    ...options,
    credentials: 'include',
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  }
}

export async function authenticatedFetch(url, options = {}) {
  let token
  try {
    token = await getValidAccessToken()
  } catch (error) {
    if (error.status === 401) announceSessionExpired()
    throw error
  }

  let response = await fetch(url, withBearer(options, token))
  if (response.status !== 401) return response

  try {
    token = await refreshAccessToken().then((session) => session.accessToken)
  } catch (error) {
    if (error.status === 401) announceSessionExpired()
    throw error
  }

  response = await fetch(url, withBearer(options, token))
  if (response.status === 401) announceSessionExpired()
  return response
}

export function startGoogleLogin() {
  window.location.assign(`${getApiUrl()}/api/auth/google`)
}

export async function fetchCurrentUser() {
  const response = await authenticatedFetch(`${getApiUrl()}/api/auth/me`)
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.message || 'Could not load your profile')
  return result.data
}

export async function restoreSession() {
  try {
    await refreshAccessToken()
    return await fetchCurrentUser()
  } catch (error) {
    if (error.status === 401) clearSession()
    else {
      accessToken = null
      accessTokenExpiresAt = 0
    }
    return null
  }
}

export async function logoutSession() {
  const response = await fetch(`${getApiUrl()}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Dot-CSRF': '1',
    },
    body: '{}',
  })
  if (!response.ok) throw new Error('Could not revoke the current session')
  clearSession()
}

/** Clear any previous token URL format and read an OAuth error, if present. */
export function consumeAuthRedirect() {
  const params = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.slice(1))
  const authError = params.get('authError')

  params.delete('token')
  params.delete('authError')
  hashParams.delete('token')
  const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${hashParams.toString() ? `#${hashParams}` : ''}`
  if (window.location.search || window.location.hash.includes('token=')) {
    window.history.replaceState({}, '', next)
  }

  return { authError }
}
