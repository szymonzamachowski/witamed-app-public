import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpOnSquareIcon,
  EllipsisVerticalIcon,
  PlusCircleIcon,
  BellIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline'
import { detectPlatform } from '../hooks/usePushNotifications'
import { useAuth } from '../hooks/useAuth'
import './install.css'

export const APP_URL = 'your-app.vercel.app'

type Platform = 'ios' | 'android'

/** Zdarzenie Chrome na Androidzie pozwalające pokazać własny przycisk „Zainstaluj”. */
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const STEPS: Record<Platform, { icon: ReactNode; text: ReactNode }[]> = {
  ios: [
    { icon: <span className="step-url">Safari</span>, text: <>Otwórz <b>{APP_URL}</b> w <b>Safari</b> (nie w Messengerze ani Chrome).</> },
    { icon: <ArrowUpOnSquareIcon />, text: <>Stuknij <b>Udostępnij</b> — kwadrat ze strzałką w górę na dolnym pasku.</> },
    { icon: <PlusCircleIcon />, text: <>Przewiń listę i wybierz <b>„Do ekranu początkowego”</b>.</> },
    { icon: <span className="step-url">Dodaj</span>, text: <>Stuknij <b>„Dodaj”</b> w prawym górnym rogu. Ikona Witamed pojawi się na ekranie.</> },
  ],
  android: [
    { icon: <span className="step-url">Chrome</span>, text: <>Otwórz <b>{APP_URL}</b> w <b>Chrome</b>.</> },
    { icon: <EllipsisVerticalIcon />, text: <>Stuknij <b>⋮</b> (trzy kropki) w prawym górnym rogu.</> },
    { icon: <DevicePhoneMobileIcon />, text: <>Wybierz <b>„Zainstaluj aplikację”</b> albo <b>„Dodaj do ekranu głównego”</b>.</> },
    { icon: <span className="step-url">OK</span>, text: <>Potwierdź <b>„Zainstaluj”</b>. Ikona Witamed pojawi się na ekranie.</> },
  ],
}

export default function Install() {
  const { user } = useAuth()
  const [{ isIOS, isStandalone }] = useState(detectPlatform)
  const [platform, setPlatform] = useState<Platform>(isIOS ? 'ios' : 'android')
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as InstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const install = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    setInstallPrompt(null)
  }

  return (
    <div className="page install">
      <header>
        <h1>Witamed na telefonie</h1>
        <p className="muted">Dodaj Witamed do ekranu głównego — działa jak aplikacja i może wysyłać powiadomienia.</p>
      </header>

      {isStandalone && (
        <div className="card install-done">
          ✅ Witamed jest już zainstalowany na tym telefonie. Został ostatni krok — powiadomienia (niżej).
        </div>
      )}

      {installPrompt && !isStandalone && (
        <button type="button" className="btn btn-primary install-now" onClick={install}>
          Zainstaluj Witamed teraz
        </button>
      )}

      <div className="segmented install-tabs" role="tablist" aria-label="Telefon">
        <button type="button" role="tab" aria-selected={platform === 'ios'} className={platform === 'ios' ? 'active' : ''} onClick={() => setPlatform('ios')}>
          iPhone
        </button>
        <button type="button" role="tab" aria-selected={platform === 'android'} className={platform === 'android' ? 'active' : ''} onClick={() => setPlatform('android')}>
          Android
        </button>
      </div>

      <ol className="install-steps">
        {STEPS[platform].map((step, i) => (
          <li key={i} className="card install-step">
            <span className="install-step-no display">{i + 1}</span>
            <span className="install-step-icon" aria-hidden="true">{step.icon}</span>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>

      {platform === 'ios' && (
        <p className="muted install-note">Wymagany iOS 16.4 lub nowszy. Powiadomienia na iPhonie działają tylko z ikony na ekranie głównym.</p>
      )}

      <section className="card install-notif">
        <BellIcon className="install-notif-icon" aria-hidden="true" />
        <div>
          <h2>Włącz powiadomienia</h2>
          <p>
            Otwórz Witamed <b>z ikony na ekranie</b>, zaloguj się, wejdź w <b>Moje konto → Powiadomienia</b> i stuknij{' '}
            <b>„Włącz powiadomienia”</b>, a potem <b>„Zezwól”</b>.
          </p>
          <Link to={user ? '/account' : '/login?redirect=%2Faccount'} className="btn btn-primary">
            {user ? 'Przejdź do powiadomień' : 'Zaloguj się'}
          </Link>
        </div>
      </section>
    </div>
  )
}
