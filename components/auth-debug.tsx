// Debug component to check auth state
'use client';

import { useAuth } from '@/components/auth/auth-provider';

export default function AuthDebug() {
  const { user, isLoading } = useAuth();
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-sm text-xs">
      <h3 className="font-bold">Auth Debug</h3>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      <p>User: {user ? 'Logged in' : 'Not logged in'}</p>
      {user && (
        <div>
          <p>Email: {user.email}</p>
          <p>Name: {user.name}</p>
          <p>Role: {user.role}</p>
        </div>
      )}
    </div>
  );
}
