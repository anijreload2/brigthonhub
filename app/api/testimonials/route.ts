import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // First, get ALL testimonials to see what's in the database
    const { data: allTestimonials, error: allError } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('Error fetching all testimonials:', allError);
    } else {
      console.log('📋 All testimonials in database:', allTestimonials?.length || 0);
      allTestimonials?.forEach((t, i) => {
        console.log(`  ${i+1}. ID: ${t.id} | Active: ${t.is_active} | Name: ${t.name || t.client_name}`);
      });
    }

    // Now get only active ones
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active testimonials:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Active testimonials found:', data?.length || 0);

    // Map old field names to new ones for backward compatibility
    const mappedTestimonials = data?.map(testimonial => ({
      ...testimonial,
      // Map old field names to new ones if they exist
      name: testimonial.name || testimonial.client_name,
      role: testimonial.role || testimonial.client_title, 
      company: testimonial.company || testimonial.client_company,
      content: testimonial.content || testimonial.testimonial_text
    })) || [];

    return NextResponse.json({ testimonials: mappedTestimonials });
  } catch (error: any) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Set default values for new testimonials
    const testimonialData = {
      ...body,
      rating: body.rating || 5,
      is_featured: body.is_featured || false,
      is_active: body.is_active !== undefined ? body.is_active : true
    };

    // Only add display_order if it's provided
    if (body.display_order !== undefined) {
      testimonialData.display_order = body.display_order;
    }

    const { data, error } = await supabase
      .from('testimonials')
      .insert([testimonialData])
      .select()
      .single();

    if (error) {
      console.error('Error creating testimonial:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ testimonial: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
