import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/vendors - Get public vendor listings
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/vendors - Starting request');
    
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '20';
    const offset = url.searchParams.get('offset') || '0';
    const status = url.searchParams.get('status') || 'active';

    console.log('📊 Query parameters:', { limit, offset, status });

    // Query vendors table for public listing
    let query = supabase
      .from('vendors')
      .select('id, name, email, status, created_at')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    console.log('🔍 Executing database query...');
    const { data: vendors, error } = await query;

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }

    console.log('✅ Query successful, found', vendors?.length || 0, 'vendors');
    return NextResponse.json({ 
      vendors: vendors || [],
      total: vendors?.length || 0
    });

  } catch (error) {
    console.error('❌ Unexpected error in vendors GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
