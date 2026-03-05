import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PUBLIC_LINKS } from '@/constants/navigation';

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

  return {
    pathname,
    mobileMenuOpen,
    setMobileMenuOpen,
    mounted,
    isActive,
    // Only public links in main nav - protected routes go in user menu
    visibleLinks: PUBLIC_LINKS,
    publicLinks: PUBLIC_LINKS,
  };
}
