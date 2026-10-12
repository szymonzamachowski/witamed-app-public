import { Link } from 'react-router-dom'
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline'
import { usePushNotifications } from '../hooks/usePushNotifications'
import './notifications.css'

export default function NotificationsCard() {
  const { status, busy, error, subscribe, unsubscribe, sendTest } = usePushNotifications()

  return (
    <div className="card notif-card">
      <div className="notif-head">
        <span className={`notif-icon ${status === 'on' ? 'is-on' : ''}`}>
          {status === 'on' ? <BellIcon aria-hidden="true" /> : <BellSlashIcon aria-hidden="true" />}
        </span>
        <div>
          <strong>{status === 'on' ? 'Powiadomienia włączone' : 'Powiadomienia wyłączone'}</strong>
          <p className="muted">
            Przypomnienia o obecności, treningach i meczach oraz info o nowym wideo i statystykach.
          </p>
        </div>
      </div>

      {status === 'loading' && <p className="muted">Sprawdzanie…</p>}

      {status === 'needs-install' && (
        <p className="notif-note">
          Na iPhonie powiadomienia działają tylko po dodaniu Witamed do ekranu głównego.{' '}
          <Link to="/instalacja">Zobacz jak to zrobić</Link>
        </p>
      )}

      {status === 'unsupported' && (
        <p className="notif-note">
          Ta przeglądarka nie obsługuje powiadomień. <Link to="/instalacja">Zobacz poradnik</Link>
        </p>
      )}

      {status === 'denied' && (
        <p className="notif-note">
          Powiadomienia są zablokowane w ustawieniach telefonu/przeglądarki dla tej strony. Odblokuj je tam i odśwież stronę.
        </p>
      )}

      {status === 'off' && (
        <button type="button" className="btn btn-primary" onClick={subscribe} disabled={busy}>
          {busy ? 'Włączanie…' : 'Włącz powiadomienia'}
        </button>
      )}

      {status === 'on' && (
        <div className="notif-actions">
          <button type="button" className="btn btn-secondary" onClick={sendTest} disabled={busy}>
            Wyślij test
          </button>
          <button type="button" className="btn btn-ghost" onClick={unsubscribe} disabled={busy}>
            Wyłącz
          </button>
        </div>
      )}

      {error && <p className="notif-error">{error}</p>}
    </div>
  )
}
