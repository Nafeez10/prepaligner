import { AbstractLLMProvider } from './AbstractLLMProvider';
import { config } from '../../config/env';

export class GroqProvider extends AbstractLLMProvider {
  private readonly apiKey: string;
  private readonly model = 'qwen/qwen3.8-27b';
  private readonly endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    super();
    this.apiKey = config.apiKeys.groq;
    if (!this.apiKey) {
      console.warn('GROQ_API_KEY is not set. GroqProvider will fail if called.');
    }
  }

  public async generateJSON<T>(prompt: string, _schema: unknown): Promise<T> {
    const payload = {
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    };

    return this.callWithBackoff(() => this.callApi<T>(payload, true));
  }

  public async generateText(prompt: string): Promise<string> {
    const payload = {
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
    };

    const data = await this.callWithBackoff(() => this.callApi<unknown>(payload, false));
    return (data as any)?.choices?.[0]?.message?.content || '';
  }

  private async callApi<T>(payload: unknown, isJson: boolean): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 429) throw new Error('Rate limited');
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Groq LLM Error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const textOutput: string = data?.choices?.[0]?.message?.content || '';

    if (isJson) return this.parseJsonOutput<T>(textOutput);
    return data as T;
  }
}
