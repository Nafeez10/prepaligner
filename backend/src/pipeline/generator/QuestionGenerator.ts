import { ILLMProvider } from '../llm/ILLMProvider';
import { Question, Requirement } from '../../types/schemas';
import { v4 as uuidv4 } from 'uuid';

export class QuestionGenerator {
  constructor(private llm: ILLMProvider) {}

  public async generateQuestions(requirements: Requirement[], companyContext: string): Promise<Question[]> {
    if (requirements.length === 0) return [];

    const prompt = `
You are an expert technical interviewer. Generate interview questions based on the following requirements and company context.
Generate at least one question per requirement. Some questions can cover multiple requirements.

For each question, specify:
- category: "technical", "behavioural", "system-design", or "company-fit"
- prompt: The interview question
- answer_outline: What a good answer looks like
- difficulty: 1, 2, or 3 (3 being hardest)
- requirement_ids: Array of requirement IDs this question covers.

Company Context:
<untrusted_content>
${companyContext}
</untrusted_content>

Requirements:
${JSON.stringify(requirements, null, 2)}

Respond with JSON in the following format:
[
  {
    "requirement_ids": ["r_id1"],
    "category": "technical",
    "prompt": "Question text...",
    "answer_outline": "Expected answer...",
    "difficulty": 2
  }
]
    `;

    const generated = await this.llm.generateJSON<any[]>(prompt, {});
    
    // Ensure stable IDs and correct format
    return (generated || []).map((q: any) => ({
      id: `q_${uuidv4()}`,
      requirement_ids: q.requirement_ids || [],
      category: q.category || 'technical',
      prompt: q.prompt || '',
      answer_outline: q.answer_outline || '',
      difficulty: q.difficulty || 2
    }));
  }
}
