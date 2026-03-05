'use client';

import { NavLink } from './nav-link';
import { AuthButtons } from './auth-buttons';
import { UserMenu } from './user-menu';
import { DesktopNavProps } from '@/types/navigation';

export function DesktopNav({
  visibleLinks,
  isActive,
  isAuthenticated,
  user,
  onLogout,
  onNavigate,
}: DesktopNavProps) {
  return (
    <div className="hidden md:flex items-center gap-6">
      {visibleLinks.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          label={link.label}
          isActive={isActive(link.href)}
          variant="desktop"
        />
      ))}
      
      {/* Auth Section */}
      <div className="flex items-center gap-3 ml-4 pl-4 border-l" style={{ borderColor: 'var(--border)' }}>
        {isAuthenticated && user ? (
          <UserMenu 
            user={user} 
            onLogout={onLogout} 
            variant="desktop"
          />
        ) : (
          <AuthButtons
            onLogin={() => onNavigate('/login')}
            onSignUp={() => onNavigate('/register')}
            variant="desktop"
          />
        )}
      </div>
    </div>
  );
}
