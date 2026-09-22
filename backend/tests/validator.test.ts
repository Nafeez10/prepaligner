import { describe, it, expect } from 'vitest';
import { KitSchema } from '../src/types/schemas';

describe('Appendix A Validator (KitSchema)', () => {
  it('should validate a perfectly formed kit', () => {
    const validKit = {
      source: {
        company: "Acme Corp",
        company_url: "https://acme.com",
        role: "Senior Backend Engineer",
        location: "Remote",
        jd_chars: 1200,
        researched_at: "2026-09-01T09:12:44Z",
        pages_used: ["https://acme.com/careers"]
      },
      company_brief: {
        summary: "Acme is a widget company.",
        what_they_do: "They make widgets.",
        sources: ["https://acme.com/about"]
      },
      role: {
        title: "Senior Backend Engineer",
        seniority: "Senior",
        responsibilities: ["Build APIs"],
        requirements: [
          {
            id: "r1",
            text: "5+ years with React", // Purposely mixed to match PDF example
            kind: "technical",
            priority: "must"
          }
        ]
      },
      questions: [
        {
          id: "q1",
          requirement_ids: ["r1"],
          category: "technical",
          prompt: "Explain React hooks.",
          answer_outline: "State and lifecycle.",
          difficulty: 2
        }
      ],
      flashcards: [
        {
          id: "f1",
          front: "What is a hook?",
          back: "A function.",
          requirement_ids: ["r1"]
        }
      ],
      schedule: {
        days_available: 5,
        days: [
          {
            day: 1,
            focus: "React Fundamentals",
            question_ids: ["q1"],
            minutes: 60
          }
        ]
      },
      coverage: {
        uncovered_requirement_ids: [],
        passes: 2
      }
    };

    const result = KitSchema.safeParse(validKit);
    expect(result.success).toBe(true);
  });

  it('should fail if difficulty is not 1, 2, or 3', () => {
    const invalidKit = {
      source: { company: "", company_url: "http://test.com", role: "", location: "", jd_chars: 0, researched_at: "", pages_used: [] },
      company_brief: { summary: "", what_they_do: "", sources: [] },
      role: { title: "", seniority: "", responsibilities: [], requirements: [] },
      questions: [
        { id: "q1", requirement_ids: [], category: "technical", prompt: "", answer_outline: "", difficulty: 4 } // invalid
      ],
      flashcards: [],
      schedule: { days_available: 1, days: [] },
      coverage: { uncovered_requirement_ids: [], passes: 1 }
    };

    const result = KitSchema.safeParse(invalidKit);
    expect(result.success).toBe(false);
  });
});
