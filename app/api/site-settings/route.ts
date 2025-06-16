import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      console.error('Error fetching site settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convert array to key-value object for easier access
    const settings = data?.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        type: setting.type,
        id: setting.id
      };
      return acc;
    }, {} as Record<string, any>) || {};

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, type = 'string' } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    const settingItem = {
      id: crypto.randomUUID(),
      key,
      value: String(value),
      type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('site_settings')
      .insert([settingItem])
      .select()
      .single();

    if (error) {
      console.error('Error creating site setting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ setting: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating site setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, type } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    // Update existing setting by key
    const { data, error } = await supabase
      .from('site_settings')
      .update({ 
        value: String(value), 
        type: type || 'string',
        updatedAt: new Date().toISOString() 
      })
      .eq('key', key)
      .select()
      .single();

    if (error) {
      console.error('Error updating site setting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ setting: data });
  } catch (error: any) {
    console.error('Error updating site setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('site_settings')
      .delete()
      .eq('key', key);

    if (error) {
      console.error('Error deleting site setting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Site setting deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting site setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
