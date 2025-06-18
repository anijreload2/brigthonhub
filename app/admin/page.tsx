'use client';

import { useAuth } from '../../components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '../../lib/types';
import AdminDashboard from '../../components/admin/AdminDashboard';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Add a small delay to allow auth state to stabilize
    const timeout = setTimeout(() => {
      if (!user) {
        router.push('/auth/login?redirect=/admin');
        return;
      }

      // Check if user is admin
      if (user.role !== UserRole.ADMIN) {
        router.push('/');
        return;
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [user, router]);

  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking access...</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}