import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabase';

export async function GET() {
  try {
    const adminClient = getAdminClient();
    
    // Get training data grouped by category to create quick actions
    const { data: trainingData, error } = await adminClient
      .from('ai_training_data')
      .select('question, category')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching training data for quick actions:', error);
      return NextResponse.json({ error: 'Failed to fetch quick actions' }, { status: 500 });
    }

    // Group questions by category and create quick actions
    const categoryMap: Record<string, any> = {
      'general': { icon: 'MessageSquare', title: 'About BrightonHub', description: 'Learn about our platform' },
      'properties': { icon: 'Home', title: 'Property Search', description: 'Find properties in Lagos' },
      'food': { icon: 'Utensils', title: 'Food Supply', description: 'Bulk food ordering' },
      'services': { icon: 'ShoppingCart', title: 'Our Services', description: 'Explore what we offer' },
      'contact': { icon: 'MessageSquare', title: 'Contact Info', description: 'Get in touch with us' },
      'coverage': { icon: 'Briefcase', title: 'Coverage Areas', description: 'Where we operate' }
    };

    // Create quick actions from training data
    const quickActions = trainingData?.slice(0, 6).map((item, index) => ({
      id: `action-${index}`,
      icon: categoryMap[item.category]?.icon || 'MessageSquare',
      title: categoryMap[item.category]?.title || item.category.charAt(0).toUpperCase() + item.category.slice(1),
      description: categoryMap[item.category]?.description || `Ask about ${item.category}`,
      prompt: item.question
    })) || [];

    // If we don't have enough training data, add some default actions
    const defaultActions = [
      {
        id: 'default-1',
        icon: 'Home',
        title: 'Property Search',
        description: 'Find properties in Lagos',
        prompt: 'Help me find a 3-bedroom apartment in Lekki, Lagos under ₦50 million'
      },
      {
        id: 'default-2',
        icon: 'Utensils',
        title: 'Food Supply',
        description: 'Bulk food ordering',
        prompt: 'I need to order fresh tomatoes and peppers for my restaurant in bulk'
      }
    ];

    const actions = quickActions.length >= 4 ? quickActions : [...quickActions, ...defaultActions].slice(0, 6);

    return NextResponse.json({ quickActions: actions });

  } catch (error: any) {
    console.error('Error in quick actions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
