import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const Icon = theme === 'dark' ? SunIcon : MoonIcon

  return (
    <button
      type="button"
      className="icon-button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Włącz jasny motyw' : 'Włącz ciemny motyw'}
      title={theme === 'dark' ? 'Jasny motyw' : 'Ciemny motyw'}
    >
      <Icon aria-hidden="true" />
    </button>
  )
}
