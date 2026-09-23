import { ILLMProvider } from './ILLMProvider';
import { GeminiProvider } from './GeminiProvider';
import { GroqProvider } from './GroqProvider';
import { CohereProvider } from './CohereProvider';
import { MockProvider } from './MockProvider';
import { config } from '../../config/env';

type ProviderName = 'gemini' | 'groq' | 'cohere';

export type ProviderDescriptor = {
  id: ProviderName;
  name: string;
};

const PROVIDERS: ProviderDescriptor[] = [
  { id: 'gemini', name: 'Gemini (Google AI Studio)' },
  { id: 'groq', name: 'Qwen via Groq' },
  { id: 'cohere', name: 'Command-R (Cohere)' },
];

export class LLMProviderFactory {
  /** Returns the list of available providers (single source of truth for backend + API). */
  static getProviderList(): ProviderDescriptor[] {
    return PROVIDERS;
  }

  static createProvider(providerName: string = 'gemini'): ILLMProvider {
    if (config.useMockLlm) return new MockProvider();

    switch (providerName.toLowerCase() as ProviderName) {
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
