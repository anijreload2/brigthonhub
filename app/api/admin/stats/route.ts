import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();

    // Get counts from different tables
    const [
      { count: usersCount, error: usersError },
      { count: propertiesCount, error: propertiesError },
      { count: projectsCount, error: projectsError },
      { count: foodItemsCount, error: foodError }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('projects').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('food_items').select('*', { count: 'exact', head: true })
    ]);

    if (usersError || propertiesError || projectsError || foodError) {
      console.error('Error fetching stats:', { usersError, propertiesError, projectsError, foodError });
    }

    // Get recent activity - latest users
    const { data: recentUsers, error: recentUsersError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent properties
    const { data: recentProperties, error: recentPropertiesError } = await supabaseAdmin
      .from('properties')
      .select('id, title, price, location, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const stats = {
      totalUsers: usersCount || 0,
      totalProperties: propertiesCount || 0,
      totalProjects: projectsCount || 0,
      totalFoodItems: foodItemsCount || 0,
      recentUsers: recentUsers || [],
      recentProperties: recentProperties || []
    };

    return NextResponse.json({ success: true, data: stats });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
