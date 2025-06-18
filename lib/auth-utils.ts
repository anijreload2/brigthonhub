// Utility function to get authorization headers for API calls
import { supabase } from '@/lib/supabase';

export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };
    }
    
    return {
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return {
      'Content-Type': 'application/json'
    };
  }
}

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  console.log('🔐 authenticatedFetch called for URL:', url);
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('❌ Auth session error:', error);
    throw new Error('Failed to get auth session');
  }
  
  if (!session?.access_token) {
    console.error('❌ No access token found in session');
    throw new Error('No authentication token available');
  }
  
  console.log('✅ Token found, preview:', session.access_token.substring(0, 50) + '...');
  console.log('� Token expires at:', new Date(session.expires_at! * 1000).toISOString());
  console.log('⏰ Current time:', new Date().toISOString());
  
  const headers = {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  console.log('📤 Making request with headers:', Object.keys(headers));
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  console.log('📥 Response status:', response.status);
  console.log('📋 Response headers:', Object.fromEntries(response.headers));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Request failed:', response.status, errorText);
    throw new Error(`Request failed: ${response.status} - ${errorText}`);
  }
  
  return response;
}
