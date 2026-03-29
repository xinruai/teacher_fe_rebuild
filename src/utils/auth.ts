import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'

export function getToken(): string | undefined {
  return Cookies.get(TokenKey)
}

export function setToken(token: string): string | undefined {
  return Cookies.set(TokenKey, token)
}

export function removeToken(): void {
  Cookies.remove(TokenKey)
}

export function getSession(key: string): string | null {
  return window.sessionStorage.getItem(key)
}

export function setSession(key: string, value: string): void {
  window.sessionStorage.setItem(key, value)
}

export function removeSession(key: string): void {
  window.sessionStorage.removeItem(key)
}

export function getLocal<T = unknown>(key: string): T | null {
  const val = window.localStorage.getItem(key)
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T
    } catch {
      return val as unknown as T
    }
  }
  return null
}

export function setLocal(key: string, value: unknown): void {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function removeLocal(key: string): void {
  window.localStorage.removeItem(key)
}

export function getCookie(name: string): string | null {
  const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  const arr = document.cookie.match(reg)
  if (arr) return arr[2]
  return null
}

export function setCookie(name: string, value: string, expireDays?: number): void {
  let expires = ''
  if (expireDays != null) {
    const exdate = new Date()
    exdate.setDate(exdate.getDate() + expireDays)
    expires = ';expires=' + exdate.toUTCString()
  }
  document.cookie = name + '=' + encodeURIComponent(value) + expires
}

export function delCookie(name: string): void {
  const exp = new Date()
  exp.setTime(exp.getTime() - 1)
  const cval = getCookie(name)
  if (cval != null) {
    document.cookie = name + '=' + cval + ';expires=' + exp.toUTCString()
  }
}
