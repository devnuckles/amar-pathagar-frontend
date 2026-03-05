import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PUBLIC_LINKS, PROTECTED_LINKS } from '@/constants/navigation';
import { NavLink } from '@/types/navigation';

export function useNavigation(isAuthenticated: boolean) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getVisibleLinks = (): NavLink[] => {
    return isAuthenticated 
      ? [...PUBLIC_LINKS, ...PROTECTED_LINKS]
      : PUBLIC_LINKS;
  };

  return {
    pathname,
    mobileMenuOpen,
    setMobileMenuOpen,
    mounted,
    isActive,
    visibleLinks: getVisibleLinks(),
    publicLinks: PUBLIC_LINKS,
    protectedLinks: PROTECTED_LINKS,
  };
}
