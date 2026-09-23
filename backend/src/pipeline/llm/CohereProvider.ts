import { AbstractLLMProvider } from './AbstractLLMProvider';
import { config } from '../../config/env';

export class CohereProvider extends AbstractLLMProvider {
  private readonly apiKey: string;
  private readonly model = 'command-r-plus-08-2024';
  private readonly endpoint = 'https://api.cohere.com/v1/chat';

  constructor() {
    super();
    this.apiKey = config.apiKeys.cohere;
    if (!this.apiKey) {
      console.warn('COHERE_API_KEY is not set. CohereProvider will fail if called.');
    }
  }

  public async generateJSON<T>(prompt: string, _schema: unknown): Promise<T> {
    const payload = {
      model: this.model,
      message: `${prompt}\n\nPlease return strictly valid JSON without any markdown or conversational text.`,
    };

    return this.callWithBackoff(() => this.callApi<T>(payload, true));
  }

  public async generateText(prompt: string): Promise<string> {
    const payload = { model: this.model, message: prompt };
    const data = await this.callWithBackoff(() => this.callApi<unknown>(payload, false));
    return (data as any)?.text || '';
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
      throw new Error(`Cohere LLM Error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const textOutput: string = (data as any)?.text || '';

    if (isJson) return this.parseJsonOutput<T>(textOutput);
    return data as T;
  }
}
