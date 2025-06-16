// OpenRouter AI Service
// Handles communication with OpenRouter API using admin-configured settings

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: 'assistant' | 'user' | 'system';
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenRouterService {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string, model: string = 'mistralai/mistral-7b-instruct:free') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(messages: ChatMessage[], context?: string): Promise<string> {
    try {
      // Add system context if provided (from training data)
      const systemMessages: ChatMessage[] = [];
      
      if (context) {
        systemMessages.push({
          role: 'system',
          content: `You are BrightonHub AI Assistant, helping with real estate, food supply, marketplace, and project planning in Lagos, Nigeria. Use this context to inform your responses: ${context}`
        });
      } else {
        systemMessages.push({
          role: 'system',
          content: 'You are BrightonHub AI Assistant, helping with real estate, food supply, marketplace, and project planning in Lagos, Nigeria. Be helpful, professional, and knowledgeable about Nigerian business and real estate markets.'
        });
      }

      const fullMessages = [...systemMessages, ...messages];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'BrightonHub AI Assistant'
        },
        body: JSON.stringify({
          model: this.model,
          messages: fullMessages,
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API error:', response.status, errorData);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenRouter');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter service error:', error);
      throw error;
    }
  }

  // Get available models (free Mistral models)
  static getAvailableModels() {
    return [
      {
        id: 'mistralai/mistral-7b-instruct:free',
        name: 'Mistral 7B Instruct (Free)',
        description: 'Fast and efficient model for general tasks'
      },
      {
        id: 'mistralai/mixtral-8x7b-instruct:free',
        name: 'Mixtral 8x7B Instruct (Free)',
        description: 'More powerful model for complex reasoning'
      },
      {
        id: 'openchat/openchat-7b:free',
        name: 'OpenChat 7B (Free)',
        description: 'Alternative free model option'
      },
      {
        id: 'google/gemma-7b-it:free',
        name: 'Gemma 7B IT (Free)',
        description: 'Google\'s lightweight model'
      }
    ];
  }
}
