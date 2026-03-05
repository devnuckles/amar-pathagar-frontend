export interface NavLink {
  href: string;
  label: string;
  protected?: boolean;
}

export interface User {
  username: string;
  full_name?: string;
  success_score?: number;
  role?: string;
}

export interface NavigationProps {
  isAuthenticated?: boolean;
  user?: User | null;
  onLogout?: () => void;
}

export interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  variant?: 'desktop' | 'mobile';
}

export interface AuthButtonsProps {
  onLogin: () => void;
  onSignUp: () => void;
  variant?: 'desktop' | 'mobile';
}

export interface UserMenuProps {
  user: User;
  onLogout: () => void;
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

export interface DesktopNavProps {
  visibleLinks: NavLink[];
  isActive: (href: string) => boolean;
  isAuthenticated: boolean;
  user: User | null;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

export interface MobileNavProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  publicLinks: NavLink[];
  protectedLinks: NavLink[];
  isActive: (href: string) => boolean;
  isAuthenticated: boolean;
  user: User | null;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}
