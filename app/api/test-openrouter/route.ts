import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openrouterApiKey) {
      return NextResponse.json({ error: 'No API key found' }, { status: 400 });
    }

    // Try a simple API call to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const result = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      apiKeyLength: openrouterApiKey.length,
      apiKeyPreview: openrouterApiKey.substring(0, 20) + '...',
    };

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        ...result,
        error: errorText 
      });
    }

    const data = await response.json();
    return NextResponse.json({ 
      ...result,
      success: true,
      modelsCount: data.data?.length || 0
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
