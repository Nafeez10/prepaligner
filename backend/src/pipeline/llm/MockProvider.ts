import { ILLMProvider } from './ILLMProvider';

/**
 * Mock provider for deterministic offline testing and evaluation without API keys.
 */
export class MockProvider implements ILLMProvider {
  public async generateJSON<T>(prompt: string, schema: any): Promise<T> {
    // We try to return a sensible default mock based on the prompt content
    
    if (prompt.includes('Extract the role details') || prompt.includes('Extract')) {
      return {
        title: "Software Engineer",
        seniority: "Mid",
        responsibilities: ["Write code"],
        requirements: [
          { id: "r1", text: "React experience", kind: "technical", priority: "must" }
        ]
      } as any;
    }
    
    if (prompt.includes('Generate interview questions') || prompt.includes('focused interview question')) {
      return [
        {
          id: "q_mock_1",
          requirement_ids: ["r1"],
          category: "technical",
          prompt: "What is a React hook?",
          answer_outline: "Explain hooks.",
          difficulty: 2
        }
      ] as any;
    }
    
    if (prompt.includes('flashcards')) {
      return [
        {
          id: "f_mock_1",
          front: "React Hook",
          back: "A function.",
          requirement_ids: ["r1"]
        }
      ] as any;
    }
    
    if (prompt.includes('brief')) {
      return {
        summary: "A company.",
        what_they_do: "Things.",
        sources: []
      } as any;
    }

    // Generic fallback
    return {} as T;
  }

  public async generateText(prompt: string): Promise<string> {
    return "Mock response";
  }
}
