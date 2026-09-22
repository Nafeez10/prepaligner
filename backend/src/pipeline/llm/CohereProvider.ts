import { ILLMProvider } from './ILLMProvider';

export class CohereProvider implements ILLMProvider {
  private apiKey: string;
  private model: string;
  private endpoint: string;

  constructor() {
    this.apiKey = process.env.COHERE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('COHERE_API_KEY is not set. CohereProvider will fail if called.');
    }
    this.model = 'command-r-plus-08-2024';
    this.endpoint = 'https://api.cohere.com/v1/chat';
  }

  public async generateJSON<T>(prompt: string, schema: any): Promise<T> {
    const payload = {
      model: this.model,
      message: prompt + '\n\nPlease return strictly valid JSON without any markdown or conversational text.'
    };

    return this.callWithBackoff<T>(payload, true);
  }

  public async generateText(prompt: string): Promise<string> {
    const payload = {
      model: this.model,
      message: prompt
    };

    const res = await this.callWithBackoff<any>(payload, false);
    return res.text || '';
  }

  private async callWithBackoff<T>(payload: any, isJson: boolean, retries = 3): Promise<T> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(payload)
        });

        if (response.status === 429) {
          throw new Error('Rate limited');
        }

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Cohere LLM Error ${response.status}: ${text}`);
        }

        const data = await response.json();
        const textOutput = data.text || '';
        
        if (isJson) {
          try {
            return JSON.parse(textOutput) as T;
          } catch (e) {
            const cleaned = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned) as T;
          }
        }
        
        return data as T;
      } catch (error) {
        attempt++;
        if (attempt >= retries) throw error;
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise(r => setTimeout(r, delay));
      }
    }
    throw new Error('Unreachable');
  }
}
