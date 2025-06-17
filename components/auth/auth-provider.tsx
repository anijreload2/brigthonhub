
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/lib/types';
import { getRoleBasedRedirectUrl } from '@/lib/auth-utils';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, redirectAfterLogin?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirectAfterLogin, setShouldRedirectAfterLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Fetching user profile for:', supabaseUser.email);
      
      // Get user data from our users table using email
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          *,
          profile:user_profiles(*)
        `)
        .eq('email', supabaseUser.email)
        .single();

      console.log('User data fetch result:', { userData, error });

      if (error || !userData) {
        // If user doesn't exist in our database, create them
        if (error?.code === 'PGRST116') { // Not found error
          console.log('User not found in database, creating new record');
          await createUserRecord(supabaseUser);
          return;
        }
        console.error('Failed to fetch user profile:', error);
        setUser(null);
      } else {
        console.log('Setting user data:', userData);
        const newUser = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          phone: userData.phone,
          isActive: userData.isActive,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          profile: userData.profile
        };
        
        setUser(newUser);
        
        // Handle role-based redirect after login
        if (shouldRedirectAfterLogin && newUser.role) {
          setShouldRedirectAfterLogin(false);
          const redirectUrl = getRoleBasedRedirectUrl(newUser.role);
          console.log('Post-login redirect:', newUser.role, '->', redirectUrl);
          
          // Use setTimeout to ensure state is updated before redirect
          setTimeout(() => {
            router.push(redirectUrl);
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createUserRecord = async (supabaseUser: SupabaseUser) => {
    try {
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const profileId = `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.name || '',
          role: 'REGISTERED',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      if (userError) {
        console.error('Failed to create user record:', userError);
        return;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: profileId,
          userId: userId,
          firstName: supabaseUser.user_metadata?.name?.split(' ')[0] || '',
          lastName: supabaseUser.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Failed to create user profile:', profileError);
      }

      // Fetch the newly created user
      await fetchUserProfile(supabaseUser);
    } catch (error) {
      console.error('Error creating user record:', error);
    }
  };

  const login = async (email: string, password: string, redirectAfterLogin: boolean = true) => {
    setShouldRedirectAfterLogin(redirectAfterLogin);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setShouldRedirectAfterLogin(false);
      throw new Error(error.message);
    }

    // User profile will be fetched automatically by the auth state change listener
    // The redirect will happen in fetchUserProfile if shouldRedirectAfterLogin is true
  };

  const register = async (email: string, password: string, name: string) => {
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name, // Store name in user metadata
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed - no user returned');
    }

    // User record will be created automatically by the auth state change listener
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
    // User state will be cleared automatically by the auth state change listener
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
