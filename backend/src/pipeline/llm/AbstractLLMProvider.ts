import { ILLMProvider } from './ILLMProvider';

/**
 * Base class for all LLM providers.
 * Provides a shared exponential backoff retry mechanism so individual
 * providers only implement the API-specific logic.
 */
export abstract class AbstractLLMProvider implements ILLMProvider {
  abstract generateJSON<T>(prompt: string, schema: unknown): Promise<T>;
  abstract generateText(prompt: string): Promise<string>;

  /**
   * Wraps an async API call with exponential backoff + jitter.
   * @param fn         - The API call to retry
   * @param retries    - Maximum number of attempts (default 3)
   */
  protected async callWithBackoff<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await fn();
      } catch (error) {
        attempt++;
        if (attempt >= retries) throw error;
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    // Unreachable — while loop always throws or returns before this
    throw new Error('[AbstractLLMProvider] Retry loop exited unexpectedly');
  }

  /**
   * Parses a raw LLM text output as JSON.
   * Handles responses wrapped in markdown code fences (```json ... ```).
   */
  protected parseJsonOutput<T>(raw: string): T {
    try {
      return JSON.parse(raw) as T;
    } catch {
      const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned) as T;
    }
  }
}
