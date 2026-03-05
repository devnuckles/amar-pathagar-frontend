'use client';

import { Button } from '@/components/ui/button';
import { AuthButtonsProps } from '@/types/navigation';

export function AuthButtons({ onLogin, onSignUp, variant = 'desktop' }: AuthButtonsProps) {
  const isFullWidth = variant === 'mobile';

  return (
    <div className={`space-y-2 ${variant === 'desktop' ? 'flex gap-3 space-y-0' : ''}`}>
      <Button 
        variant="outline" 
        size="sm"
        className={`rounded-lg font-medium transition-all duration-200 ${isFullWidth ? 'w-full' : ''}`}
        onClick={onLogin}
      >
        Login
      </Button>
      <Button 
        size="sm"
        className={`rounded-lg font-medium transition-all duration-200 ${isFullWidth ? 'w-full' : ''}`}
        onClick={onSignUp}
      >
        Sign Up
      </Button>
    </div>
  );
}
