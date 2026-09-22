import { ILLMProvider } from '../llm/ILLMProvider';
import { Question, Requirement } from '../../types/schemas';
import { v4 as uuidv4 } from 'uuid';

export class SecondPassEngine {
  constructor(private llm: ILLMProvider) {}

  public async generateGapQuestions(uncoveredRequirements: Requirement[], companyContext: string): Promise<Question[]> {
    if (uncoveredRequirements.length === 0) return [];

    const prompt = `
You are an expert technical interviewer. In our previous pass, we missed generating questions for some critical requirements.
Please generate exactly one focused interview question for EACH of the following uncovered requirements.

Company Context:
<untrusted_content>
${companyContext}
</untrusted_content>

Uncovered Requirements:
${JSON.stringify(uncoveredRequirements, null, 2)}

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
