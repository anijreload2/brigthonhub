
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

      
      // Get user data from our users table using email
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          *,
          profile:user_profiles(*)
        `)
        .eq('email', supabaseUser.email)
        .single();



      if (error || !userData) {
        // If user doesn't exist in our database, create them
        if (error?.code === 'PGRST116') { // Not found error

          await createUserRecord(supabaseUser);
          return;
        }

        setUser(null);
      } else {

        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          phone: userData.phone,
          is_active: userData.is_active,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
          profile: userData.profile
        });
      }
    } catch (error) {

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
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (userError) {

        return;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: profileId,
          user_id: userId,
          first_name: supabaseUser.user_metadata?.name?.split(' ')[0] || '',
          last_name: supabaseUser.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {

      }

      // Fetch the newly created user
      await fetchUserProfile(supabaseUser);
    } catch (error) {

    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // User profile will be fetched automatically by the auth state change listener
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
