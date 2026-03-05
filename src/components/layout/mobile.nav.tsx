'use client';

import { Logo } from '@/components/common/logo';
import { NavLink } from './nav.link';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { MobileNavProps } from '@/types/navigation';

export function MobileNav({
  isOpen,
  onOpenChange,
  publicLinks,
  isActive,
  onNavigate,
}: MobileNavProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[320px] sm:w-[400px] p-0">
        <SheetHeader className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <Logo size="nav" />
        </SheetHeader>
        
        <div className="px-4 py-6 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
          {/* Navigation Links */}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
