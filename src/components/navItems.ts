import type { ComponentType, SVGProps } from 'react'
import {
  HomeIcon,
  CheckCircleIcon,
  TrophyIcon,
  ChartBarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'

export type NavItem = {
  to: string
  label: string
  end?: boolean
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Główna', end: true, Icon: HomeIcon },
  { to: '/attendance', label: 'Obecność', Icon: CheckCircleIcon },
  { to: '/matches', label: 'Mecze', Icon: TrophyIcon },
  { to: '/statistics', label: 'Statystyki', Icon: ChartBarIcon },
  { to: '/calendar', label: 'Terminarz', Icon: CalendarDaysIcon },
]
