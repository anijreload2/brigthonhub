import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './types'

// Use a more robust singleton pattern with global storage
declare global {
  var __supabase: SupabaseClient<Database> | undefined
  var __supabaseAdmin: SupabaseClient<Database> | undefined
  var memoryStorage: Record<string, string> | undefined
}

// Function to get environment variables safely
function getEnvVars() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Ensure required environment variables are present
  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = []
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    throw new Error(`Missing required Supabase environment variables: ${missing.join(', ')}`)
  }

  return { 
    supabaseUrl, 
    supabaseAnonKey, 
    supabaseServiceRoleKey 
  }
}

// Function to detect if storage is available
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const testKey = 'supabase-storage-test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('Browser storage blocked by tracking prevention');
    return false;
  }
}

// Custom storage implementation that falls back gracefully
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('Storage access blocked, using in-memory fallback');
      return globalThis.memoryStorage?.[key] || null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('Storage access blocked, using in-memory fallback');
      if (!globalThis.memoryStorage) globalThis.memoryStorage = {};
      globalThis.memoryStorage[key] = value;
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage access blocked, using in-memory fallback');
      if (globalThis.memoryStorage) {
        delete globalThis.memoryStorage[key];
      }
    }
  },
};

// Function to get or create the main Supabase client
function getSupabaseClient(): SupabaseClient<Database> {  if (typeof window !== 'undefined' && globalThis.__supabase) {
    return globalThis.__supabase
  }

  if (typeof window === 'undefined' && global.__supabase) {
    return global.__supabase
  }
  const { supabaseUrl, supabaseAnonKey } = getEnvVars()

  const storageAvailable = isStorageAvailable();

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: storageAvailable,
      autoRefreshToken: true,
      detectSessionInUrl: storageAvailable,
      storage: storageAvailable ? undefined : customStorage,
    }
  })
  // Store in global to ensure singleton
  if (typeof window !== 'undefined') {
    globalThis.__supabase = client
  } else {
    global.__supabase = client
  }

  return client
}

// Function to get or create the admin Supabase client (SERVER-SIDE ONLY)
function getSupabaseAdminClient(): SupabaseClient<Database> {
  // Prevent admin client creation in the browser
  if (typeof window !== 'undefined') {
    throw new Error('Admin client cannot be used in the browser. This should only be used server-side.')
  }

  if (global.__supabaseAdmin) {
    return global.__supabaseAdmin
  }

  const { supabaseUrl, supabaseServiceRoleKey } = getEnvVars()
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(`Missing Supabase admin environment variables: URL=${!!supabaseUrl}, ServiceKey=${!!supabaseServiceRoleKey}`)
  }

  const adminClient = createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
  
  // Store in global to ensure singleton
  global.__supabaseAdmin = adminClient
  console.log('✅ Supabase admin client created (server-side)')

  return adminClient
}

// Export the singleton instances
export const supabase = getSupabaseClient()

// Export a function for admin client instead of the instance directly
// This ensures it's only created when explicitly called and only server-side
export function getAdminClient(): SupabaseClient<Database> {
  return getSupabaseAdminClient()
}
