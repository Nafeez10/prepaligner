import { ILLMProvider } from '../llm/ILLMProvider';
import { Flashcard, Question } from '../../types/schemas';
import { v4 as uuidv4 } from 'uuid';

export class FlashcardGenerator {
  constructor(private llm: ILLMProvider) {}

  public async generateFlashcards(questions: Question[]): Promise<Flashcard[]> {
    if (questions.length === 0) return [];

    // To save tokens, we'll only generate flashcards for a subset of technical/domain questions
    const eligibleQuestions = questions.filter(q => q.category === 'technical' || q.category === 'system-design').slice(0, 10);
    
    if (eligibleQuestions.length === 0) return [];

    const prompt = `
Create concise, bite-sized study flashcards based on the following interview questions.
Each flashcard should test a specific concept from the question or answer outline.
Keep the 'front' under 15 words and the 'back' under 30 words.

Questions:
${JSON.stringify(eligibleQuestions, null, 2)}

Respond with JSON in the following format:
[
  {
    "requirement_ids": ["r_id1"],
    "front": "Short question...",
    "back": "Short answer..."
  }
]
    `;

    const generated = await this.llm.generateJSON<any[]>(prompt, {});
    
    return (generated || []).map((f: any) => ({
      id: `f_${uuidv4()}`,
      requirement_ids: f.requirement_ids || [],
      front: f.front || '',
      back: f.back || ''
    }));
  }
}
