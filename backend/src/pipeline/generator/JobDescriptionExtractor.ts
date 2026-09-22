import { ILLMProvider } from '../llm/ILLMProvider';
import { Requirement } from '../../types/schemas';
import { v4 as uuidv4 } from 'uuid';

export interface ExtractedRole {
  title: string;
  seniority: string;
  responsibilities: string[];
  requirements: Requirement[];
}

export class JobDescriptionExtractor {
  constructor(private llm: ILLMProvider) {}

  public async extract(jdText: string): Promise<ExtractedRole> {
    const prompt = `
You are an expert technical recruiter. Extract the role details and specific requirements from the following job description.

Classify each requirement as:
- kind: "technical", "behavioural", or "domain"
- priority: "must" (must-have) or "nice" (nice-to-have / bonus)

If the description is very thin (e.g., just a couple of lines), do not invent requirements. Report honestly only what is there.

Respond with JSON in the following format:
{
  "title": "Role Title",
  "seniority": "Seniority Level",
  "responsibilities": ["Resp 1", "Resp 2"],
  "requirements": [
    {
      "text": "Exact text or concise summary of requirement",
      "kind": "technical", 
      "priority": "must"
    }
  ]
}

<untrusted_content>
${jdText}
</untrusted_content>
    `;

    const result = await this.llm.generateJSON<any>(prompt, {});
    
    // Add stable IDs to requirements
    if (result && Array.isArray(result.requirements)) {
      result.requirements = result.requirements.map((req: any) => ({
        ...req,
        id: `r_${uuidv4()}`
      }));
    }

    return result as ExtractedRole;
  }
}
