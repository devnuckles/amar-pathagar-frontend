import { User } from '@/types/navigation';

export function getUserInitial(user: User | null): string {
  if (!user) return 'U';
  
  if (user.full_name) {
    return user.full_name.charAt(0).toUpperCase();
  }
  if (user.username) {
    return user.username.charAt(0).toUpperCase();
  }
  return 'U';
}

export function getUserDisplayName(user: User | null): string {
  if (!user) return 'User';
  return user.full_name || user.username || 'User';
}
