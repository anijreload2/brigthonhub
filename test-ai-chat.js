require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Test the AI chat API locally to debug the 400 error
async function testAIChat() {
  console.log('🧪 Testing AI Chat API...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing Supabase environment variables');
    return;
  }

  console.log('✅ Environment variables found');
  console.log('URL:', supabaseUrl);
  console.log('Anon key preview:', supabaseAnonKey.substring(0, 20) + '...');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Check if we can get site settings
    console.log('\n📋 Test 1: Checking site_settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('*')
      .in('key', ['openrouter_api_key', 'openrouter_model']);

    if (settingsError) {
      console.log('❌ Settings error:', settingsError);
    } else {
      console.log('✅ Settings found:', settings?.length || 0);
      settings?.forEach(setting => {
        if (setting.key === 'openrouter_api_key') {
          console.log('  - API Key:', setting.value?.substring(0, 20) + '...');
        } else {
          console.log(`  - ${setting.key}:`, setting.value);
        }
      });
    }

    // Test 2: Check training data
    console.log('\n📋 Test 2: Checking ai_training_data...');
    const { data: trainingData, error: trainingError } = await supabase
      .from('ai_training_data')
      .select('*')
      .limit(3);

    if (trainingError) {
      console.log('❌ Training data error:', trainingError);
    } else {
      console.log('✅ Training data found:', trainingData?.length || 0);
    }

    // Test 3: Simulate the exact request format from the frontend
    console.log('\n📋 Test 3: Testing request format...');
    
    const testRequest = {
      message: "What is BrightonHub?",
      userId: "admin-001"
    };

    console.log('Request body:', JSON.stringify(testRequest, null, 2));
    
    // Check if request body matches expected format
    if (!testRequest.message || typeof testRequest.message !== 'string') {
      console.log('❌ Invalid message format');
    } else if (!testRequest.userId || typeof testRequest.userId !== 'string') {
      console.log('❌ Invalid userId format');
    } else {
      console.log('✅ Request format looks correct');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testAIChat().catch(console.error);
