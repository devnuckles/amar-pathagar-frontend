'use client';

import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  LayoutDashboard, 
  Library, 
  History, 
  Settings 
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown.menu';
import { UserMenuProps } from '@/types/navigation';
import { USER_MENU_ITEMS } from '@/constants/navigation';
import { getUserInitial, getUserDisplayName } from '@/utils/user';

const iconMap = {
  LayoutDashboard,
  Library,
  History,
  Settings,
};

export function UserMenu({ user, onLogout, variant = 'desktop', onNavigate }: UserMenuProps) {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    if (onNavigate) {
      onNavigate();
    }
  };

  // Mobile Header Variant - Compact avatar button with dropdown
  if (variant === 'mobile-header') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            className="flex items-center justify-center p-1.5 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-[var(--border)]"
            style={{ 
              backgroundColor: 'transparent',
              color: 'var(--foreground)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback 
                className="text-sm font-bold"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)'
                }}
              >
                {getUserInitial(user)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {getUserDisplayName(user)}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                @{user.username}
              </p>
              {user.success_score !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                    Score: {user.success_score}
                  </span>
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {USER_MENU_ITEMS.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <DropdownMenuItem 
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                <span style={{ color: 'var(--foreground)' }}>{item.label}</span>
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={onLogout} 
            className="cursor-pointer"
            variant="destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Desktop Variant
  if (variant === 'desktop') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-[var(--border)]"
            style={{ 
              backgroundColor: 'transparent',
              color: 'var(--foreground)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback 
                className="text-sm font-bold"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)'
                }}
              >
                {getUserInitial(user)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm hidden lg:inline">
              {getUserDisplayName(user)}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {getUserDisplayName(user)}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                @{user.username}
              </p>
              {user.success_score !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                    Score: {user.success_score}
                  </span>
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {USER_MENU_ITEMS.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <DropdownMenuItem 
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                <span style={{ color: 'var(--foreground)' }}>{item.label}</span>
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={onLogout} 
            className="cursor-pointer"
            variant="destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Mobile variant - Improved UX
  return (
    <div className="space-y-3">
      {/* User Info Card - More compact */}
      <div 
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg border"
        style={{ 
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >
        <Avatar className="w-10 h-10">
          <AvatarFallback 
            className="text-base font-bold"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            {getUserInitial(user)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--foreground)' }}>
            {getUserDisplayName(user)}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
              @{user.username}
            </p>
            {user.success_score !== undefined && (
              <>
                <span style={{ color: 'var(--border)' }}>•</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                  {user.success_score}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Menu Items - Cleaner layout */}
      <div className="space-y-0.5">
        {USER_MENU_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          return (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer border border-transparent"
              style={{ color: 'var(--foreground)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--muted)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <Icon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Logout Button - Separated */}
      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => {
            onLogout();
            if (onNavigate) {
              onNavigate();
            }
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer border"
          style={{ 
            color: 'var(--destructive)',
            borderColor: 'var(--border)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--destructive)';
            e.currentTarget.style.color = 'var(--destructive-foreground)';
            e.currentTarget.style.borderColor = 'var(--destructive)';
            const icon = e.currentTarget.querySelector('svg');
            if (icon) (icon as SVGElement).style.color = 'var(--destructive-foreground)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--destructive)';
            e.currentTarget.style.borderColor = 'var(--border)';
            const icon = e.currentTarget.querySelector('svg');
            if (icon) (icon as SVGElement).style.color = 'var(--destructive)';
          }}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--destructive)' }} />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
