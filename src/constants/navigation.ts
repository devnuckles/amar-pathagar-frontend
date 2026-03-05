import { NavLink } from '@/types/navigation';

export const PUBLIC_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/books', label: 'Books' },
  { href: '/blog', label: 'Blog' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

export const PROTECTED_LINKS: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', protected: true },
  { href: '/my-library', label: 'My Library', protected: true },
  { href: '/reading-history', label: 'History', protected: true },
  { href: '/profile/edit', label: 'Profile', protected: true },
];
