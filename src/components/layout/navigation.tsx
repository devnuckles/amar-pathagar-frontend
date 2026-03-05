'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from './logo';
import { Menu, X, LogOut, User, Settings } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface NavLink {
  href: string;
  label: string;
  protected?: boolean;
}

interface User {
  username: string;
  full_name?: string;
  success_score?: number;
  role?: string;
}

interface NavigationProps {
  isAuthenticated?: boolean;
  user?: User | null;
  onLogout?: () => void;
}

const publicLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/books', label: 'Books' },
  { href: '/blog', label: 'Blog' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

const protectedLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', protected: true },
  { href: '/my-library', label: 'My Library', protected: true },
  { href: '/reading-history', label: 'History', protected: true },
  { href: '/profile/edit', label: 'Profile', protected: true },
];

export function Navigation({ isAuthenticated = false, user = null, onLogout }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const visibleLinks = isAuthenticated 
    ? [...publicLinks, ...protectedLinks]
    : publicLinks;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const getUserInitial = () => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return user?.full_name || user?.username || 'User';
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
          {/* Logo */}
          <Logo size="nav" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-3 py-2 font-medium text-sm transition-all duration-200
                  ${isActive(link.href)
                    ? 'border-b-2'
                    : 'rounded-md'
                  }
                `}
                style={{
                  color: isActive(link.href) 
                    ? 'var(--primary)' 
                    : 'var(--foreground)',
                  borderColor: isActive(link.href) 
                    ? 'var(--primary)' 
                    : 'transparent',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.href)) {
                    e.currentTarget.style.backgroundColor = 'var(--muted)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.href)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Auth Section - Desktop */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l" style={{ borderColor: 'var(--border)' }}>
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 h-10 px-3 rounded-lg transition-all duration-200">
                      <Badge 
                        variant="default" 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      >
                        {getUserInitial()}
                      </Badge>
                      <span className="font-medium text-sm">{getUserDisplayName()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{getUserDisplayName()}</p>
                        {user.success_score !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            Score: {user.success_score}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile/edit')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-lg font-medium transition-all duration-200"
                    onClick={() => router.push('/login')}
                  >
                    Login
                  </Button>
                  <Button 
                    size="sm"
                    className="rounded-lg font-medium transition-all duration-200"
                    onClick={() => router.push('/register')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 rounded-lg transition-colors hover:opacity-70"
                style={{
                  color: 'var(--foreground)'
                }}
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] sm:w-[400px] p-0">
              <SheetHeader className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <Logo size="nav" />
              </SheetHeader>
              <div className="px-4 py-6 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
                {/* Navigation Links */}
                <nav className="space-y-1">
                  {visibleLinks.slice(0, publicLinks.length).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        block px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                        ${isActive(link.href) ? 'border-b-2' : ''}
                      `}
                      style={{
                        color: isActive(link.href)
                          ? 'var(--primary)'
                          : 'var(--foreground)',
                        borderColor: isActive(link.href)
                          ? 'var(--primary)'
                          : 'transparent',
                        backgroundColor: isActive(link.href) ? 'var(--muted)' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(link.href)) {
                          e.currentTarget.style.backgroundColor = 'var(--muted)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(link.href)) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Protected Links Section */}
                {isAuthenticated && protectedLinks.length > 0 && (
                  <>
                    <div className="border-t" style={{ borderColor: 'var(--border)' }} />
                    <nav className="space-y-1">
                      {visibleLinks.slice(publicLinks.length).map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`
                            block px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                            ${isActive(link.href) ? 'border-b-2' : ''}
                          `}
                          style={{
                            color: isActive(link.href)
                              ? 'var(--primary)'
                              : 'var(--foreground)',
                            borderColor: isActive(link.href)
                              ? 'var(--primary)'
                              : 'transparent',
                            backgroundColor: isActive(link.href) ? 'var(--muted)' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive(link.href)) {
                              e.currentTarget.style.backgroundColor = 'var(--muted)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive(link.href)) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                  </>
                )}

                {/* Auth Section - Mobile */}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  {isAuthenticated && user ? (
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
                          {getUserInitial()}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{getUserDisplayName()}</p>
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
                          onClick={() => {
                            router.push('/profile/edit');
                            setMobileMenuOpen(false);
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start rounded-lg transition-all duration-200"
                          onClick={() => {
                            router.push('/dashboard');
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="w-full justify-start rounded-lg transition-all duration-200"
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full rounded-lg font-medium transition-all duration-200"
                        onClick={() => {
                          router.push('/login');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Login
                      </Button>
                      <Button 
                        className="w-full rounded-lg font-medium transition-all duration-200"
                        onClick={() => {
                          router.push('/register');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
