import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
const ENABLED_KEY = 'witamed-push-enabled'

/** Czy na tym urządzeniu włączono powiadomienia (szybka odpowiedź, zanim sprawdzimy subskrypcję). */
export function pushEnabledHere() {
  try {
    return localStorage.getItem(ENABLED_KEY) === '1'
  } catch {
    return false
  }
}

function rememberEnabled(enabled: boolean) {
  try {
    if (enabled) localStorage.setItem(ENABLED_KEY, '1')
    else localStorage.removeItem(ENABLED_KEY)
  } catch {
    // brak localStorage - stan sprawdzany z subskrypcji
  }
}

/** Rejestracja service workera; czeka na nią (max 4 s), bo zaraz po wejściu może jej jeszcze nie być. */
async function getRegistration() {
  const existing = await navigator.serviceWorker.getRegistration()
  if (existing) return existing
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<undefined>(resolve => setTimeout(() => resolve(undefined), 4000)),
  ])
}

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, c => c.charCodeAt(0))
}

export function detectPlatform() {
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  const isAndroid = /Android/.test(ua)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  return { isIOS, isAndroid, isStandalone }
}

export type PushStatus =
  | 'loading'
  | 'unsupported' // przeglądarka nie obsługuje albo brak klucza
  | 'needs-install' // iPhone: najpierw dodaj do ekranu głównego
  | 'denied' // użytkownik zablokował powiadomienia
  | 'off'
  | 'on'

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('loading')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const { isIOS, isStandalone } = detectPlatform()
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    if (isIOS && !isStandalone) return setStatus('needs-install')
    if (!supported || !VAPID_PUBLIC_KEY) return setStatus('unsupported')
    if (Notification.permission === 'denied') return setStatus('denied')
    const registration = await getRegistration()
    const subscription = await registration?.pushManager.getSubscription()
    const enabled = !!subscription && Notification.permission === 'granted'
    rememberEnabled(enabled)
    setStatus(enabled ? 'on' : 'off')
  }, [])

  useEffect(() => {
    refresh().catch(() => setStatus('unsupported'))
  }, [refresh])

  const subscribe = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        await refresh()
        return
      }
      const registration = await navigator.serviceWorker.ready
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }))
      const { error } = await supabase.functions.invoke('send-push', {
        body: { mode: 'subscribe', subscription: subscription.toJSON(), userAgent: navigator.userAgent },
      })
      if (error) throw error
      rememberEnabled(true)
      setStatus('on')
    } catch (e) {
      console.error('Nie udało się włączyć powiadomień:', e)
      setError('Nie udało się włączyć powiadomień. Spróbuj ponownie.')
    } finally {
      setBusy(false)
    }
  }, [refresh])

  const unsubscribe = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const registration = await getRegistration()
      const subscription = await registration?.pushManager.getSubscription()
      if (subscription) {
        await supabase.functions.invoke('send-push', { body: { mode: 'unsubscribe', endpoint: subscription.endpoint } })
        await subscription.unsubscribe()
      }
      rememberEnabled(false)
      setStatus('off')
    } catch (e) {
      console.error('Nie udało się wyłączyć powiadomień:', e)
      setError('Nie udało się wyłączyć powiadomień.')
    } finally {
      setBusy(false)
    }
  }, [])

  const sendTest = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const { data, error } = await supabase.functions.invoke('send-push', { body: { mode: 'test' } })
      if (error) throw error
      if (!data?.sent) setError('Nie znaleziono tego urządzenia — wyłącz i włącz powiadomienia ponownie.')
    } catch (e) {
      console.error('Test powiadomienia nie powiódł się:', e)
      setError('Nie udało się wysłać testu.')
    } finally {
      setBusy(false)
    }
  }, [])

  return { status, busy, error, subscribe, unsubscribe, sendTest }
}
