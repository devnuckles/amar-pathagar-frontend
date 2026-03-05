'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuProps } from '@/types/navigation';
import { getUserInitial, getUserDisplayName } from '@/utils/user';

export function UserMenu({ user, onLogout, variant = 'desktop', onNavigate }: UserMenuProps) {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    if (onNavigate) {
      onNavigate();
    }
  };

  if (variant === 'desktop') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 h-10 px-3 rounded-lg transition-all duration-200">
            <Badge 
              variant="default" 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            >
              {getUserInitial(user)}
            </Badge>
            <span className="font-medium text-sm">{getUserDisplayName(user)}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{getUserDisplayName(user)}</p>
              {user.success_score !== undefined && (
                <p className="text-xs text-muted-foreground">
                  Score: {user.success_score}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/profile/edit')}>
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard')}>
            <Settings className="mr-2 h-4 w-4" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-4">
      {/* User Info */}
      <div 
        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
        style={{ backgroundColor: 'var(--muted)' }}
      >
        <Badge 
          variant="default" 
          className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold"
        >
          {getUserInitial(user)}
        </Badge>
        <div className="flex-1">
          <p className="font-medium text-sm">{getUserDisplayName(user)}</p>
          {user.success_score !== undefined && (
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Score: {user.success_score}
            </p>
          )}
        </div>
      </div>
      
      {/* User Actions */}
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start rounded-lg transition-all duration-200"
          onClick={() => handleNavigation('/profile/edit')}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          Profile
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start rounded-lg transition-all duration-200"
          onClick={() => handleNavigation('/dashboard')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <Button 
          variant="destructive" 
          className="w-full justify-start rounded-lg transition-all duration-200"
          onClick={() => {
            onLogout();
            if (onNavigate) {
              onNavigate();
            }
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
