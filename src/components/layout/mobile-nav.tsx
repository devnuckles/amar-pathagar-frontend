'use client';

import { Menu } from 'lucide-react';
import { Logo } from '@/components/common/logo';
import { NavLink } from './nav-link';
import { AuthButtons } from './auth-buttons';
import { UserMenu } from './user-menu';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { MobileNavProps } from '@/types/navigation';

export function MobileNav({
  isOpen,
  onOpenChange,
  publicLinks,
  protectedLinks,
  isActive,
  isAuthenticated,
  user,
  onLogout,
  onNavigate,
}: MobileNavProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <button
        onClick={() => onOpenChange(true)}
        className="md:hidden p-2 rounded-lg transition-colors hover:opacity-70"
        style={{ color: 'var(--foreground)' }}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <SheetContent side="left" className="w-[320px] sm:w-[400px] p-0">
        <SheetHeader className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <Logo size="nav" />
        </SheetHeader>
        
        <div className="px-4 py-6 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
          {/* Public Links */}
          <nav className="space-y-1">
            {publicLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={isActive(link.href)}
                onClick={handleClose}
                variant="mobile"
              />
            ))}
          </nav>

          {/* Protected Links */}
          {isAuthenticated && protectedLinks.length > 0 && (
            <>
              <div className="border-t" style={{ borderColor: 'var(--border)' }} />
              <nav className="space-y-1">
                {protectedLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    isActive={isActive(link.href)}
                    onClick={handleClose}
                    variant="mobile"
                  />
                ))}
              </nav>
            </>
          )}

          {/* Auth Section */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {isAuthenticated && user ? (
              <UserMenu 
                user={user} 
                onLogout={onLogout} 
                variant="mobile"
                onNavigate={handleClose}
              />
            ) : (
              <AuthButtons
                onLogin={() => {
                  onNavigate('/login');
                  handleClose();
                }}
                onSignUp={() => {
                  onNavigate('/register');
                  handleClose();
                }}
                variant="mobile"
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
