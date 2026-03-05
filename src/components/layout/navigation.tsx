'use client';

import { useRouter } from 'next/navigation';
import { Logo } from '@/components/common/logo';
import { DesktopNav } from './desktop.nav';
import { MobileNav } from './mobile.nav';
import { useNavigation } from '@/hooks/useNavigation';
import { useAuthStore } from '@/store/authStore';

export function Navigation() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    mounted,
    isActive,
    visibleLinks,
    publicLinks,
    protectedLinks,
  } = useNavigation(isAuthenticated);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (!mounted) {
    return null;
  }

  return (
    <nav 
      className="sticky top-0 z-40 border-b"
      style={{ 
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="nav" />

          <DesktopNav
            visibleLinks={visibleLinks}
            isActive={isActive}
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={handleLogout}
            onNavigate={handleNavigation}
          />

          <MobileNav
            isOpen={mobileMenuOpen}
            onOpenChange={setMobileMenuOpen}
            publicLinks={publicLinks}
            protectedLinks={protectedLinks}
            isActive={isActive}
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={handleLogout}
            onNavigate={handleNavigation}
          />
        </div>
      </div>
    </nav>
  );
}
