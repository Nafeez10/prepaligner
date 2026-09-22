import { ILLMProvider } from './ILLMProvider';

export class GeminiProvider implements ILLMProvider {
  private apiKey: string;
  private model: string;
  private endpoint: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY is not set. GeminiProvider will fail if called.');
    }
    this.model = 'gemini-3.6-flash';
    this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  public async generateJSON<T>(prompt: string, schema: any): Promise<T> {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: "application/json",
        // In a real implementation we would pass the schema to response_schema,
        // but for simplicity and maximum compatibility, we prompt it to return JSON
        // matching the schema.
      }
    };

    return this.callWithBackoff<T>(payload);
  }

  public async generateText(prompt: string): Promise<string> {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const res = await this.callWithBackoff<any>(payload);
    return res.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private async callWithBackoff<T>(payload: any, retries = 3): Promise<T> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.status === 429) {
          throw new Error('Rate limited');
        }

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`LLM Error ${response.status}: ${text}`);
        }

        const data = await response.json();
        
        // Extract JSON from response if response_mime_type was used
        const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        if (payload.generationConfig?.response_mime_type === "application/json") {
          try {
            return JSON.parse(textOutput) as T;
          } catch (e) {
            // Strip markdown formatting if any
            const cleaned = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned) as T;
          }
        }
        
        return data as T;
      } catch (error) {
        attempt++;
        if (attempt >= retries) throw error;
        // Exponential backoff with jitter
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise(r => setTimeout(r, delay));
      }
    }
    throw new Error('Unreachable');
  }
}
