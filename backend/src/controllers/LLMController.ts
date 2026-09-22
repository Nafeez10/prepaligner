import { Request, Response } from 'express';

export class LLMController {
  public static async getProviders(req: Request, res: Response): Promise<void> {
    const providers = [
      { id: 'gemini', name: 'Gemini (Google AI Studio)' },
      { id: 'groq', name: 'Llama 3 (Groq)' },
      { id: 'cohere', name: 'Command-R (Cohere)' }
    ];
    
    // In a fully dynamic system, this could read registered plugins.
    // For now, consolidating the list on the backend prevents frontend hardcoding.
    res.status(200).json({ providers });
  }
}
