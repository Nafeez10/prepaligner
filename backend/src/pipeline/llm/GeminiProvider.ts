import { AbstractLLMProvider } from './AbstractLLMProvider';
import { config } from '../../config/env';

export class GeminiProvider extends AbstractLLMProvider {
  private readonly apiKey: string;
  private readonly model = 'gemini-3.6-flash';
  private readonly endpoint: string;

  constructor() {
    super();
    this.apiKey = config.apiKeys.gemini;
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY is not set. GeminiProvider will fail if called.');
    }
    this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  public async generateJSON<T>(prompt: string, _schema: unknown): Promise<T> {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { response_mime_type: 'application/json' },
    };

    return this.callWithBackoff(() => this.callApi<T>(payload, true));
  }

  public async generateText(prompt: string): Promise<string> {
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    const data = await this.callWithBackoff(() => this.callApi<unknown>(payload, false));
    return (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private async callApi<T>(payload: unknown, isJson: boolean): Promise<T> {
    const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.status === 429) throw new Error('Rate limited');
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Gemini LLM Error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const textOutput: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (isJson) return this.parseJsonOutput<T>(textOutput);
    return data as T;
  }
}
