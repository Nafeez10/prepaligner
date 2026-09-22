import { ILLMProvider } from './ILLMProvider';

export class GroqProvider implements ILLMProvider {
  private apiKey: string;
  private model: string;
  private endpoint: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GROQ_API_KEY is not set. GroqProvider will fail if called.');
    }
    this.model = 'qwen/qwen3.8-27b';
    this.endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  }

  public async generateJSON<T>(prompt: string, schema: any): Promise<T> {
    const payload = {
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    };

    return this.callWithBackoff<T>(payload);
  }

  public async generateText(prompt: string): Promise<string> {
    const payload = {
      model: this.model,
      messages: [{ role: 'user', content: prompt }]
    };

    const res = await this.callWithBackoff<any>(payload);
    return res.choices?.[0]?.message?.content || '';
  }

  private async callWithBackoff<T>(payload: any, retries = 3): Promise<T> {
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
          throw new Error(`Groq LLM Error ${response.status}: ${text}`);
        }

        const data = await response.json();
        
        const textOutput = data.choices?.[0]?.message?.content || '';
        
        if (payload.response_format?.type === 'json_object') {
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
