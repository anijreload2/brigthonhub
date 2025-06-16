# BrightonHub: Prisma to Supabase Client Migration Guide

## Overview

This document provides a comprehensive guide for migrating BrightonHub from Prisma Client to Supabase Client. This migration will simplify our architecture, improve performance, and leverage Supabase's built-in features.

## Why Migrate?

### Current Issues with Prisma
- Database connection issues due to network/proxy restrictions
- Complex setup with separate schema management
- Manual authentication implementation required
- No real-time features
- Additional complexity for Supabase-specific features

### Benefits of Supabase Client
- **Built-in Authentication**: Automatic user management and auth flows
- **Real-time Subscriptions**: Live updates when data changes
- **Row Level Security (RLS)**: Database-level security policies
- **Auto-generated APIs**: REST and GraphQL APIs based on schema
- **Storage Integration**: File upload and management
- **Edge Functions**: Serverless functions
- **Better Error Handling**: More descriptive error messages
- **Simplified Setup**: One client for all Supabase features

## Migration Strategy

### Phase 1: Setup and Configuration
1. Install Supabase client
2. Configure environment variables
3. Create Supabase client instance
4. Set up database schema directly in Supabase

### Phase 2: Database Migration
1. Export current schema to Supabase
2. Migrate existing data (if any)
3. Set up Row Level Security policies
4. Create database functions if needed

### Phase 3: Code Migration
1. Replace Prisma client instances
2. Update API routes
3. Migrate authentication
4. Update component data fetching

### Phase 4: Enhanced Features
1. Implement real-time subscriptions
2. Add file storage functionality
3. Set up advanced security policies
4. Optimize performance

## Detailed Implementation Plan

### 1. Environment Setup

#### Required Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jahtkqvekhdjwoflatpg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Remove Prisma-related variables
# DATABASE_URL (no longer needed)
```

#### Package Installation
```bash
# Install Supabase client
npm install @supabase/supabase-js

# Remove Prisma dependencies
npm uninstall prisma @prisma/client
```

### 2. Client Configuration

#### Create Supabase Client (`lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side instance (for frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side instance (for API routes with elevated permissions)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
```

#### Types Definition (`lib/database.types.ts`)
```typescript
// Auto-generated types from Supabase CLI
export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          location: string
          // ... other fields
        }
        Insert: {
          // Insert types
        }
        Update: {
          // Update types
        }
      }
      // ... other tables
    }
  }
}
```

### 3. Database Schema Migration

#### Current Prisma Schema Translation
```sql
-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON properties
FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access" ON food_items  
FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access" ON projects
FOR SELECT USING (is_active = true);

-- User-specific policies
CREATE POLICY "Users can read own data" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users  
FOR UPDATE USING (auth.uid() = id);
```

### 4. API Routes Migration

#### Before (Prisma)
```typescript
// app/api/properties/route.ts
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const properties = await prisma.property.findMany({
      where: { isActive: true },
      take: 6,
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(properties)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
```

#### After (Supabase)
```typescript
// app/api/properties/route.ts
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) throw error
    return NextResponse.json(properties)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
```

### 5. Component Data Fetching Migration

#### Before (Prisma via API)
```typescript
// components/sections/featured-properties.tsx
const fetchProperties = async () => {
  const response = await fetch('/api/properties?limit=6')
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}
```

#### After (Direct Supabase)
```typescript
// components/sections/featured-properties.tsx
import { supabase } from '@/lib/supabase'

const fetchProperties = async () => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) throw error
  return data
}
```

### 6. Authentication Migration

#### Remove Custom Auth
- Delete `app/api/auth/` routes
- Remove manual JWT handling
- Remove custom user session management

#### Implement Supabase Auth
```typescript
// components/auth/auth-provider.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const AuthContext = createContext<{
  user: User | null
  loading: boolean
}>({
  user: null,
  loading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

### 7. Real-time Features Implementation

#### Live Data Updates
```typescript
// hooks/use-live-properties.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useLiveProperties() {
  const [properties, setProperties] = useState([])

  useEffect(() => {
    // Initial fetch
    fetchProperties()

    // Set up real-time subscription
    const subscription = supabase
      .channel('properties_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'properties' },
        (payload) => {
          console.log('Property changed:', payload)
          // Update local state based on change
          handleRealtimeChange(payload)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchProperties = async () => {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('is_active', true)
    
    setProperties(data || [])
  }

  return properties
}
```

### 8. File Upload Integration

#### Storage Configuration
```typescript
// lib/storage.ts
import { supabase } from './supabase'

export const uploadPropertyImage = async (file: File, propertyId: string) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${propertyId}-${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('property-images')
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('property-images')
    .getPublicUrl(fileName)

  return publicUrl
}
```

### 9. Advanced Security Policies

#### Dynamic Row Level Security
```sql
-- Users can only see their own inquiries
CREATE POLICY "Users see own inquiries" ON property_inquiries
FOR SELECT USING (user_id = auth.uid());

-- Agents can see inquiries for their properties
CREATE POLICY "Agents see property inquiries" ON property_inquiries
FOR SELECT USING (
  property_id IN (
    SELECT id FROM properties WHERE agent_id = auth.uid()
  )
);

-- Admin can see all
CREATE POLICY "Admin access" ON property_inquiries
FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

### 10. Performance Optimizations

#### Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_properties_active ON properties(is_active);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_food_items_category ON food_items(category_id);
```

#### Query Optimization
```typescript
// Efficient queries with selected fields
const { data } = await supabase
  .from('properties')
  .select(`
    id,
    title,
    price,
    location,
    images,
    property_categories(name)
  `)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
```

## Migration Checklist

### Phase 1: Setup ✅
- [ ] Install @supabase/supabase-js
- [ ] Remove Prisma dependencies  
- [ ] Update environment variables
- [ ] Create Supabase client configuration
- [ ] Set up TypeScript types

### Phase 2: Database ✅
- [ ] Create tables in Supabase dashboard
- [ ] Set up Row Level Security policies
- [ ] Create database functions if needed
- [ ] Add performance indexes
- [ ] Migrate existing data

### Phase 3: Core Migration ✅
- [ ] Replace API routes (properties, food, projects)
- [ ] Update component data fetching
- [ ] Migrate authentication system
- [ ] Remove Prisma client usage
- [ ] Update error handling

### Phase 4: Enhanced Features ✅
- [ ] Implement real-time subscriptions
- [ ] Add file storage functionality
- [ ] Set up advanced security policies
- [ ] Add database triggers if needed
- [ ] Implement edge functions

### Phase 5: Testing & Optimization ✅
- [ ] Test all API endpoints
- [ ] Verify authentication flows
- [ ] Test real-time features
- [ ] Performance testing
- [ ] Security audit

## Post-Migration Benefits

1. **Simplified Architecture**: One client for all data operations
2. **Better Performance**: Direct database connections, auto-scaling
3. **Real-time Features**: Live updates across all connected clients
4. **Enhanced Security**: Row Level Security at database level
5. **Built-in Auth**: Complete authentication system
6. **File Storage**: Integrated file upload and management
7. **Better Developer Experience**: Type-safe queries, better error messages
8. **Scalability**: Automatic scaling with Supabase infrastructure

## Rollback Plan

If issues arise during migration:
1. Keep Prisma configuration in a backup branch
2. Maintain database backups before major changes
3. Use feature flags to toggle between implementations
4. Gradual rollout by component/feature

## Support and Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Migration from Prisma Guide](https://supabase.com/docs/guides/migrations/prisma)
- [Supabase CLI](https://supabase.com/docs/reference/cli)