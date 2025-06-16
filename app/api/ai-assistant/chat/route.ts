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
    console.log('AI Chat API - Request received');
    
    let body;
    try {
      body = await request.json();
      console.log('AI Chat API - Body parsed:', { 
        hasMessage: !!body.message, 
        messageLength: body.message?.length || 0,
        conversationLength: body.conversation?.length || 0 
      });
    } catch (parseError) {
      console.error('AI Chat API - JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { message, conversation = [] } = body;

    if (!message) {
      console.log('AI Chat API - No message provided');
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (typeof message !== 'string') {
      console.log('AI Chat API - Message is not a string:', typeof message);
      return NextResponse.json({ error: 'Message must be a string' }, { status: 400 });
    }    // Initialize with fallback values - add extra logging
    let openrouterApiKey = process.env.OPENROUTER_API_KEY;
    let model = 'mistralai/mistral-7b-instruct:free';
    let systemPrompt = 'You are a helpful AI assistant for BrightonHub, a real estate and business services platform in Lagos, Nigeria. Help users with property searches, food supply, marketplace needs, and project planning.';

    console.log('AI Chat API - Step 1: Environment check:', {
      hasEnvKey: !!process.env.OPENROUTER_API_KEY,
      envKeyLength: process.env.OPENROUTER_API_KEY?.length || 0,
      envKeyPreview: process.env.OPENROUTER_API_KEY?.substring(0, 20) + '...'
    });

    // Try to get OpenRouter settings from site_settings using admin client
    try {
      console.log('AI Chat API - Step 2: Getting admin client...');
      const adminClient = getAdminClient();
      console.log('AI Chat API - Step 3: Admin client created, querying settings...');
      
      const { data: settings, error: settingsError } = await adminClient
        .from('site_settings')
        .select('key, value')
        .in('key', ['openrouter_api_key', 'openrouter_model', 'ai_system_prompt']);

      console.log('AI Chat API - Step 4: Settings query completed:', {
        hasError: !!settingsError,
        errorMessage: settingsError?.message,
        settingsCount: settings?.length || 0,
        settingsKeys: settings?.map(s => s.key) || []
      });

      if (!settingsError && settings && settings.length > 0) {
        const settingsMap = settings.reduce((acc: Record<string, string>, setting: { key: string; value: string }) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, string>);

        console.log('AI Chat API - Step 5: Settings map created:', {
          hasApiKey: !!settingsMap.openrouter_api_key,
          apiKeyLength: settingsMap.openrouter_api_key?.length || 0,
          hasModel: !!settingsMap.openrouter_model,
          hasPrompt: !!settingsMap.ai_system_prompt
        });

        // Use database settings if available, otherwise keep fallbacks
        if (settingsMap.openrouter_api_key) {
          openrouterApiKey = settingsMap.openrouter_api_key;
          console.log('AI Chat API - Step 6: Using DB API key');
        }
        if (settingsMap.openrouter_model) {
          model = settingsMap.openrouter_model;
        }
        if (settingsMap.ai_system_prompt) {
          systemPrompt = settingsMap.ai_system_prompt;
        }
      } else {
        console.log('AI Chat API - Step 6: Using fallback settings due to database error:', settingsError);
      }
    } catch (error) {
      console.log('AI Chat API - Step 6: Exception caught while fetching admin settings:', {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack'
      });
    }

    console.log('AI Chat API - Step 7: Final API key check:', {
      hasFinalKey: !!openrouterApiKey,
      finalKeyLength: openrouterApiKey?.length || 0,
      source: openrouterApiKey === process.env.OPENROUTER_API_KEY ? 'environment' : 'database'
    });if (!openrouterApiKey) {
      console.log('AI Chat API - No API key available');
      return NextResponse.json({ 
        error: 'OpenRouter API key not configured. Please set it in the admin panel or environment variables.' 
      }, { status: 400 });
    }

    console.log('AI Chat API - API key available, length:', openrouterApiKey.length);

    // Try to get training data context if available
    let trainingContext = '';
    try {
      const adminClient = getAdminClient();
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
    ];    // Call OpenRouter API
    console.log('AI Chat API - Calling OpenRouter with model:', model);
    console.log('AI Chat API - Messages count:', messages.length);
    
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

    console.log('AI Chat API - OpenRouter response status:', openrouterResponse.status);

    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text();
      console.error('AI Chat API - OpenRouter API error:', {
        status: openrouterResponse.status,
        statusText: openrouterResponse.statusText,
        errorText: errorText
      });
      return NextResponse.json({ 
        error: 'AI service temporarily unavailable',
        details: process.env.NODE_ENV === 'development' ? errorText : undefined
      }, { status: 500 });
    }    const data: OpenRouterResponse = await openrouterResponse.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

    console.log('AI Chat API - Success, response length:', aiResponse.length);

    return NextResponse.json({ 
      response: aiResponse,
      model: model,
      hasTrainingContext: !!trainingContext
    });
  } catch (error: any) {
    console.error('Error in AI chat API:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
