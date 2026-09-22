import { ILLMProvider } from './ILLMProvider';
import { GeminiProvider } from './GeminiProvider';
import { GroqProvider } from './GroqProvider';
import { CohereProvider } from './CohereProvider';
import { MockProvider } from './MockProvider';

export class LLMProviderFactory {
  public static createProvider(providerName: string = 'gemini'): ILLMProvider {
    if (process.env.USE_MOCK_LLM === 'true') {
      return new MockProvider();
    }
    
    switch (providerName.toLowerCase()) {
      case 'groq':
        return new GroqProvider();
      case 'cohere':
        return new CohereProvider();
      case 'gemini':
      default:
        return new GeminiProvider();
    }
  }
}
