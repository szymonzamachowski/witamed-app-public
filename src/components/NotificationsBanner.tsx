import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BellAlertIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { usePushNotifications, pushEnabledHere } from '../hooks/usePushNotifications'
import './notifications.css'

const DISMISS_KEY = 'witamed-notif-banner-dismissed'

function readDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

/** Jednorazowa zachęta na stronie głównej dla zalogowanych bez włączonych powiadomień. */
export default function NotificationsBanner() {
  const { user } = useAuth()
  const { status, busy, subscribe } = usePushNotifications()
  const [dismissed, setDismissed] = useState(readDismissed)

  // Gdy powiadomienia są włączone na tym urządzeniu, baner (i przycisk) znika na stałe
  if (!user || dismissed || pushEnabledHere() || !['off', 'needs-install'].includes(status)) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // brak localStorage - baner wróci po odświeżeniu
    }
  }

  return (
    <div className="card notif-banner" role="region" aria-label="Powiadomienia">
      <BellAlertIcon className="notif-banner-icon" aria-hidden="true" />
      <div className="notif-banner-text">
        <strong>Nie przegap treningu</strong>
        <p className="muted">
          {status === 'needs-install'
            ? 'Dodaj Witamed do ekranu głównego, żeby dostawać przypomnienia.'
            : 'Włącz powiadomienia o obecności, meczach i statystykach.'}
        </p>
        {status === 'needs-install' ? (
          <Link to="/instalacja" className="btn btn-primary notif-banner-btn">Jak to zrobić?</Link>
        ) : (
          <button type="button" className="btn btn-primary notif-banner-btn" onClick={subscribe} disabled={busy}>
            Włącz powiadomienia
          </button>
        )}
      </div>
      <button type="button" className="notif-banner-close" onClick={dismiss} aria-label="Zamknij">
        <XMarkIcon aria-hidden="true" />
      </button>
    </div>
  )
}
