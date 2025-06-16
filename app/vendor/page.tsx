'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function VendorPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/auth/login?redirect=/vendor');
      return;
    }

    // If user is already a vendor or admin, go to dashboard
    if (user.role === UserRole.VENDOR || user.role === UserRole.ADMIN) {
      router.push('/vendor/dashboard');
      return;
    }

    // Otherwise, go to registration
    router.push('/vendor/register');
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
