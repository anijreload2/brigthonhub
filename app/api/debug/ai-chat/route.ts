import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({
        error: 'Failed to parse request',
        step: 'parse_request',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 400 });
    }

    const { message } = body;

    if (!message) {
      return NextResponse.json({
        error: 'No message provided',
        step: 'validate_message'
      }, { status: 400 });
    }

    // Initialize with fallback values - add extra logging
    let openrouterApiKey = process.env.OPENROUTER_API_KEY;
    let model = 'mistralai/mistral-7b-instruct:free';    const debugInfo = {
      step1_environment: {
        hasEnvKey: !!process.env.OPENROUTER_API_KEY,
        envKeyLength: process.env.OPENROUTER_API_KEY?.length || 0,
        envKeyPreview: process.env.OPENROUTER_API_KEY?.substring(0, 20) + '...'
      },
      step2_admin_client: {} as any,
      step3_database_query: {} as any,
      step4_settings_processing: {} as any,
      step5_final_result: {} as any
    };

    // Try to get OpenRouter settings from site_settings using admin client
    try {
      debugInfo.step2_admin_client = { status: 'creating_admin_client' };
      const adminClient = getAdminClient();
      debugInfo.step2_admin_client = { status: 'admin_client_created' };
      
      debugInfo.step3_database_query = { status: 'starting_query' };
      const { data: settings, error: settingsError } = await adminClient
        .from('site_settings')
        .select('key, value')
        .in('key', ['openrouter_api_key', 'openrouter_model', 'ai_system_prompt']);

      debugInfo.step3_database_query = {
        status: 'query_completed',
        hasError: !!settingsError,
        errorMessage: settingsError?.message,
        settingsCount: settings?.length || 0,
        settingsKeys: settings?.map(s => s.key) || []
      };

      if (!settingsError && settings && settings.length > 0) {
        const settingsMap = settings.reduce((acc: Record<string, string>, setting: { key: string; value: string }) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, string>);

        debugInfo.step4_settings_processing = {
          status: 'settings_processed',
          hasApiKey: !!settingsMap.openrouter_api_key,
          apiKeyLength: settingsMap.openrouter_api_key?.length || 0,
          hasModel: !!settingsMap.openrouter_model,
          hasPrompt: !!settingsMap.ai_system_prompt
        };

        // Use database settings if available
        if (settingsMap.openrouter_api_key) {
          openrouterApiKey = settingsMap.openrouter_api_key;
        }
        if (settingsMap.openrouter_model) {
          model = settingsMap.openrouter_model;
        }
      } else {
        debugInfo.step4_settings_processing = {
          status: 'using_fallbacks',
          reason: 'database_error_or_no_settings',
          error: settingsError
        };
      }
    } catch (error) {
      debugInfo.step4_settings_processing = {
        status: 'exception_caught',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      };
    }

    debugInfo.step5_final_result = {
      hasFinalKey: !!openrouterApiKey,
      finalKeyLength: openrouterApiKey?.length || 0,
      source: openrouterApiKey === process.env.OPENROUTER_API_KEY ? 'environment' : 'database',
      model: model
    };

    return NextResponse.json({
      status: 'debug_complete',
      message: `Received message: "${message}"`,
      debugInfo: debugInfo,
      conclusion: {
        apiKeyConfigured: !!openrouterApiKey,
        wouldProceed: !!openrouterApiKey,
        errorReason: !openrouterApiKey ? 'No API key found in environment or database' : null
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Unexpected error in debug endpoint',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}
