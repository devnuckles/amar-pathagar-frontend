'use client';

import Link from 'next/link';
import { CSSProperties } from 'react';
import { NavLinkProps } from '@/types/navigation';

export function NavLink({ href, label, isActive, onClick, variant = 'desktop' }: NavLinkProps) {
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = 'var(--muted)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  const getStyles = (): CSSProperties => ({
    color: isActive ? 'var(--primary)' : 'var(--foreground)',
    borderColor: isActive ? 'var(--primary)' : 'transparent',
    backgroundColor: variant === 'mobile' && isActive ? 'var(--muted)' : 'transparent'
  });

  const getClassName = () => {
    const baseClasses = 'font-medium text-sm transition-all duration-200';
    
    if (variant === 'desktop') {
      return `${baseClasses} px-3 py-2 ${isActive ? 'border-b-2' : 'rounded-md'}`;
    }
    
    return `${baseClasses} block px-4 py-3 rounded-lg ${isActive ? 'border-b-2' : ''}`;
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className={getClassName()}
      style={getStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label}
    </Link>
  );
}
