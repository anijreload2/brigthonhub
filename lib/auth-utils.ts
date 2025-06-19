// Utility function to get authorizationaders for API calls
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

    return {
      'Content-Type': 'application/json'
    };
  }
}

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {

  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {

    throw new Error('Failed to get auth session');
  }
  
  if (!session?.access_token) {

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
  

  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  
  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`Request failed: ${response.status} - ${errorText}`);
  }
  
  return response;
}
