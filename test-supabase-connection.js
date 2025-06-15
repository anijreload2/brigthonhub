// Simple test to verify Supabase connection
import { createClient } from '@supabase/supabase-js'

// Test with the current keys from netlify.toml
const supabaseUrl = "https://jahtkqvekhdjwoflatpg.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impha3RrcXZla2hkandvZmxhdHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0Mzg0MzcsImV4cCI6MjA1MDAxNDQzN30.8wqGOBZR7jRJ5mlVJEH_VQpDl1JzUhUWvyHJTYJfmQc"

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Anon Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test 1: Basic auth check
    console.log('\n1. Testing basic connection...')
    const { data: authData, error: authError } = await supabase.auth.getUser()
    console.log('Auth test result:', { authData, authError })

    // Test 2: Try to fetch from a simple table
    console.log('\n2. Testing projects table access...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1)
    
    console.log('Projects query result:', { 
      success: !projectsError, 
      error: projectsError?.message || 'none',
      dataCount: projects?.length || 0
    })

    // Test 3: Try to fetch categories
    console.log('\n3. Testing project_categories table access...')
    const { data: categories, error: categoriesError } = await supabase
      .from('project_categories')
      .select('*')
      .limit(1)
    
    console.log('Categories query result:', { 
      success: !categoriesError, 
      error: categoriesError?.message || 'none',
      dataCount: categories?.length || 0
    })

  } catch (error) {
    console.error('Connection test failed:', error)
  }
}

testConnection()
