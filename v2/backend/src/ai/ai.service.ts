import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(AiService.name);
  private readonly defaultModel = 'nvidia/nemotron-3-ultra-550b-a55b';

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('OPENROUTER_API_KEY is not defined in environment variables.');
    }

    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey || 'missing-key',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5173', // Optional, for including your app on openrouter.ai rankings.
        'X-Title': 'Symbiosis Enterprise HRMS', // Optional. Shows in rankings on openrouter.ai.
      },
    });
  }

  /**
   * Helper method to generate text using the enterprise HRMS model
   */
  async generateText(prompt: string, systemPrompt?: string): Promise<string | null> {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      
      messages.push({ role: 'user', content: prompt });

      const response = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages,
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      this.logger.error(`Error generating text from OpenRouter: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Get raw client if more complex operations are needed
  getClient(): OpenAI {
    return this.openai;
  }
}
