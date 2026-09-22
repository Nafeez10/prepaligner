export interface ILLMProvider {
  /**
   * Generates a structured JSON response corresponding to the provided Zod schema.
   */
  generateJSON<T>(prompt: string, schema: any): Promise<T>;
  
  /**
   * Generates raw text response.
   */
  generateText(prompt: string): Promise<string>;
}
