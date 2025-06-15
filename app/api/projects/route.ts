import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Projects API: Starting request');
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = parseInt(searchParams.get('offset') || '0');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');    let query = supabase
      .from('projects')
      .select(`
        *,
        project_categories(*)
      `)
      .eq('isActive', true)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (categoryId) {
      query = query.eq('categoryId', categoryId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    console.log('Projects API: Executing Supabase query');
    const { data: projects, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects', details: error.message },
        { status: 500 }
      );
    }

    console.log('Projects API: Found', projects?.length || 0, 'projects');

    return NextResponse.json({
      projects: projects || [],
      count: projects?.length || 0
    });

  } catch (error) {
    console.error('Projects API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
