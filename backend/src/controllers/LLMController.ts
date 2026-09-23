import { Request, Response } from 'express';
import { LLMProviderFactory } from '../pipeline/llm/LLMProviderFactory';

export class LLMController {
  static getProviders(_req: Request, res: Response): void {
    res.status(200).json({ providers: LLMProviderFactory.getProviderList() });
  }
}
