import { NavLink, UserMenuItem } from '@/types/navigation';

export const PUBLIC_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/books', label: 'Books' },
  { href: '/blog', label: 'Blog' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

// User menu items - shown in dropdown when authenticated
export const USER_MENU_ITEMS: UserMenuItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/my-library', label: 'My Library', icon: 'Library' },
  { href: '/reading-history', label: 'Reading History', icon: 'History' },
  { href: '/profile/edit', label: 'Profile Settings', icon: 'Settings' },
];
