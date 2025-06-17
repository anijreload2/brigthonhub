import { UserRole } from './types';

/**
 * Get the appropriate redirect URL based on user role
 */
export function getRoleBasedRedirectUrl(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin';
    case UserRole.VENDOR:
      return '/vendor/dashboard';
    case UserRole.AGENT:
      return '/admin'; // Agents also go to admin dashboard
    case UserRole.REGISTERED:
    case UserRole.GUEST:
    default:
      return '/';
  }
}

/**
 * Get the appropriate dashboard URL for a user role
 */
export function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin';
    case UserRole.VENDOR:
      return '/vendor/dashboard';
    case UserRole.AGENT:
      return '/admin';
    case UserRole.REGISTERED:
    case UserRole.GUEST:
    default:
      return '/profile';
  }
}
