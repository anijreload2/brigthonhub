import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, category = null } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }    // Build the query conditions using admin client
    const adminClient = getAdminClient();
    let queryBuilder = adminClient
      .from('ai_training_data')
      .select('*')
      .eq('isActive', true);

    // Add category filter if provided
    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    // Search for relevant training data using text search
    queryBuilder = queryBuilder
      .or(`question.ilike.%${query}%, answer.ilike.%${query}%`)
      .order('createdAt', { ascending: false })
      .limit(10);

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error searching AI training data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }    // Format response for AI assistant consumption
    const relevantContext = data?.map((item: any) => ({
      question: item.question,
      answer: item.answer,
      category: item.category,
      relevance: calculateRelevance(query, item.question, item.answer)
    })).sort((a: any, b: any) => b.relevance - a.relevance) || [];

    return NextResponse.json({ 
      context: relevantContext,
      found: relevantContext.length > 0 
    });
  } catch (error: any) {
    console.error('Error searching AI training data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Simple relevance calculation based on keyword matching
function calculateRelevance(query: string, question: string, answer: string): number {
  const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
  const text = `${question} ${answer}`.toLowerCase();
  
  let score = 0;
  queryWords.forEach(word => {
    const questionMatches = (question.toLowerCase().match(new RegExp(word, 'g')) || []).length;
    const answerMatches = (answer.toLowerCase().match(new RegExp(word, 'g')) || []).length;
    
    // Weight question matches more heavily
    score += questionMatches * 2 + answerMatches;
  });
  
  return score;
}
