'use client';

import Link from 'next/link';

export type LogoSize = 'nav' | 'footer' | 'mobile';

interface LogoProps {
  size?: LogoSize;
  className?: string;
  variant?: 'default' | 'light'; // light variant for dark backgrounds
}

export function Logo({ size = 'nav', className = '', variant = 'default' }: LogoProps) {
  // Size configurations
  const sizeConfig = {
    nav: { height: 32, fontSize: 'text-2xl', textSize: 'text-xl' },
    footer: { height: 40, fontSize: 'text-3xl', textSize: 'text-2xl' },
    mobile: { height: 28, fontSize: 'text-xl', textSize: 'text-lg' },
  };
  
  const config = sizeConfig[size];
  
  // Color based on variant
  const textColor = variant === 'light' 
    ? 'hsl(var(--primary-foreground))' 
    : 'hsl(var(--foreground))';
  const subtitleColor = variant === 'light'
    ? 'rgba(255, 255, 255, 0.75)'
    : 'hsl(var(--muted-foreground))';
  
  return (
    <Link 
      href="/" 
      className={`flex items-center gap-2 group ${className}`}
      aria-label="Amar Pathagar - Home"
    >
      {/* Book Icon */}
      <span 
        className={`${config.fontSize} transition-transform group-hover:scale-110`}
        role="img" 
        aria-label="Book icon"
      >
        📚
      </span>
      
      {/* Logo Text */}
      <div className="flex flex-col">
        <span 
          className={`${config.textSize} font-bold uppercase tracking-wider transition-colors`}
          style={{ color: textColor }}
        >
          Amar Pathagar
        </span>
        {size !== 'mobile' && (
          <span 
            className="text-xs uppercase tracking-wider transition-colors"
            style={{ color: subtitleColor }}
          >
            Community Library
          </span>
        )}
      </div>
    </Link>
  );
}
