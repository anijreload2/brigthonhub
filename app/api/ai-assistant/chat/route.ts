import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterService, ChatMessage } from '../../../../lib/openrouter';
import { getAdminClient } from '../../../../lib/supabase';

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversation = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }    // Get OpenRouter settings from site_settings using admin client
    const adminClient = getAdminClient();
    const { data: settings, error: settingsError } = await adminClient
      .from('site_settings')
      .select('key, value')
      .in('key', ['openrouter_api_key', 'openrouter_model', 'ai_system_prompt']);

    if (settingsError) {
      console.error('Error fetching OpenRouter settings:', settingsError);
      return NextResponse.json({ error: 'Failed to get AI settings' }, { status: 500 });
    }

    const settingsMap = settings?.reduce((acc: Record<string, string>, setting: { key: string; value: string }) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>) || {};const openrouterApiKey = settingsMap.openrouter_api_key;
    const model = settingsMap.openrouter_model || 'mistralai/mistral-7b-instruct:free';
    const systemPrompt = settingsMap.ai_system_prompt || 'You are a helpful AI assistant for BrightonHub, a real estate and business services platform in Lagos, Nigeria. Help users with property searches, food supply, marketplace needs, and project planning.';

    if (!openrouterApiKey) {
      return NextResponse.json({ 
        error: 'OpenRouter API key not configured. Please set it in the admin panel.' 
      }, { status: 400 });
    }    // Get training data context if available
    let trainingContext = '';
    try {
      // Direct database query instead of internal API call for better Netlify compatibility
      const { data: trainingData, error: trainingError } = await adminClient
        .from('ai_training_data')
        .select('question, answer, category, keywords')
        .eq('is_active', true)
        .limit(3);

      if (!trainingError && trainingData && trainingData.length > 0) {
        // Simple keyword matching for relevance
        const relevantData = trainingData.filter(item => {
          const searchText = message.toLowerCase();
          const itemText = `${item.question} ${item.answer} ${item.keywords || ''}`.toLowerCase();
          return itemText.includes(searchText) || 
                 searchText.includes(item.question.toLowerCase().substring(0, 10));
        });

        if (relevantData.length > 0) {
          trainingContext = relevantData
            .slice(0, 3)
            .map(ctx => `Q: ${ctx.question}\nA: ${ctx.answer}`)
            .join('\n\n');
          console.log('Training context found:', trainingContext.substring(0, 100) + '...');
        }
      }
    } catch (error) {
      console.log('Training data query failed, continuing without context:', error);
    }

    // Build system message with context
    let systemMessage = systemPrompt;
    if (trainingContext) {
      systemMessage += `\n\nHere's some relevant information from our knowledge base:\n${trainingContext}\n\nUse this information to provide accurate and helpful responses.`;
    }

    // Prepare messages for OpenRouter
    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemMessage },
      ...conversation.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Call OpenRouter API
    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'BrightonHub AI Assistant',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text();
      console.error('OpenRouter API error:', errorText);
      return NextResponse.json({ 
        error: 'AI service temporarily unavailable' 
      }, { status: 500 });
    }

    const data: OpenRouterResponse = await openrouterResponse.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

    return NextResponse.json({ 
      response: aiResponse,
      model: model,
      hasTrainingContext: !!trainingContext
    });

  } catch (error: any) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
