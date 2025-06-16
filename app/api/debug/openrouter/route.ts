import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function GET() {
  console.log('🔍 Debug OpenRouter API - Starting check...');
  
  try {
    // Check environment variables
    const envKey = process.env.OPENROUTER_API_KEY;
    console.log('Environment variable check:', {
      hasEnvKey: !!envKey,
      envKeyLength: envKey?.length || 0,
      envKeyPreview: envKey ? envKey.substring(0, 20) + '...' : 'null'
    });

    // Check database settings
    console.log('🔍 Checking database settings...');
    const adminClient = getAdminClient();
    
    const { data: settings, error: settingsError } = await adminClient
      .from('site_settings')
      .select('key, value')
      .in('key', ['openrouter_api_key', 'openrouter_model', 'ai_system_prompt']);

    console.log('Database query result:', {
      hasError: !!settingsError,
      error: settingsError,
      settingsCount: settings?.length || 0,
      settings: settings
    });

    // Try to get the specific OpenRouter key
    let dbApiKey = null;
    if (settings && !settingsError) {
      const apiKeySetting = settings.find(s => s.key === 'openrouter_api_key');
      dbApiKey = apiKeySetting?.value || null;
      console.log('DB API key check:', {
        hasDbKey: !!dbApiKey,
        dbKeyLength: dbApiKey?.length || 0,
        dbKeyPreview: dbApiKey ? dbApiKey.substring(0, 20) + '...' : 'null'
      });
    }

    // Final decision logic
    const finalApiKey = dbApiKey || envKey;
    console.log('Final API key decision:', {
      source: dbApiKey ? 'database' : (envKey ? 'environment' : 'none'),
      hasFinalKey: !!finalApiKey,
      finalKeyLength: finalApiKey?.length || 0
    });

    return NextResponse.json({
      status: 'success',
      environment: {
        hasEnvKey: !!envKey,
        envKeyLength: envKey?.length || 0
      },
      database: {
        hasError: !!settingsError,
        error: settingsError?.message || null,
        settingsCount: settings?.length || 0,
        hasDbKey: !!dbApiKey,
        dbKeyLength: dbApiKey?.length || 0
      },
      final: {
        source: dbApiKey ? 'database' : (envKey ? 'environment' : 'none'),
        hasFinalKey: !!finalApiKey,
        isConfigured: !!finalApiKey
      }
    });

  } catch (error: any) {
    console.error('🔍 Debug OpenRouter API - Error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
