import { z } from 'zod';

// Base kit structures corresponding to Appendix A

export const RequirementSchema = z.object({
  id: z.string(),
  text: z.string(),
  kind: z.enum(['technical', 'behavioural', 'domain']),
  priority: z.enum(['must', 'nice']),
});

export const QuestionSchema = z.object({
  id: z.string(),
  requirement_ids: z.array(z.string()),
  category: z.enum(['technical', 'behavioural', 'system-design', 'company-fit']),
  prompt: z.string(),
  answer_outline: z.string(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  requirement_ids: z.array(z.string()),
});

export const ScheduleDaySchema = z.object({
  day: z.number().int(),
  focus: z.string(),
  question_ids: z.array(z.string()),
  minutes: z.number().int(),
});

export const KitSchema = z.object({
  source: z.object({
    company: z.string(),
    company_url: z.string().url().or(z.string()), // Allow local URLs or invalid formats that might slip through but technically string
    role: z.string(),
    location: z.string(),
    jd_chars: z.number().int(),
    researched_at: z.string(), // ISO string
    pages_used: z.array(z.string()),
  }),
  company_brief: z.object({
    summary: z.string(),
    what_they_do: z.string(),
    sources: z.array(z.string()),
  }),
  role: z.object({
    title: z.string(),
    seniority: z.string(),
    responsibilities: z.array(z.string()),
    requirements: z.array(RequirementSchema),
  }),
  questions: z.array(QuestionSchema),
  flashcards: z.array(FlashcardSchema),
  schedule: z.object({
    days_available: z.number().int(),
    days: z.array(ScheduleDaySchema),
  }),
  coverage: z.object({
    uncovered_requirement_ids: z.array(z.string()),
    passes: z.number().int(),
  }),
});

// Infer types
export type Requirement = z.infer<typeof RequirementSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>;
export type ScheduleDay = z.infer<typeof ScheduleDaySchema>;
export type Kit = z.infer<typeof KitSchema>;

// Batch structures corresponding to Appendix B

export const BatchInputCaseSchema = z.object({
  id: z.string(),
  jd: z.string(),
  company_url: z.string(),
  days: z.number().int(),
});

export type BatchInputCase = z.infer<typeof BatchInputCaseSchema>;
export const BatchInputSchema = z.array(BatchInputCaseSchema);

export const BatchOutputKitSchema = z.object({
  id: z.string(),
  status: z.enum(['ok', 'failed']),
  kit: KitSchema.nullable(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).nullable(),
});

export const BatchOutputSchema = z.object({
  version: z.literal("1.0"),
  generated_at: z.string(), // ISO string
  kits: z.array(BatchOutputKitSchema),
});

export type BatchOutputKit = z.infer<typeof BatchOutputKitSchema>;
export type BatchOutput = z.infer<typeof BatchOutputSchema>;

// Extended Kit Type for State Management (Section 6 - Builder State Preservation)
export interface EntityMetadata {
  origin: 'generated' | 'manual' | 'regenerated';
  is_pinned?: boolean;
  is_edited?: boolean;
  user_modified_at?: string | null;
}

export type ManagedQuestion = Question & { metadata: EntityMetadata };
export type ManagedFlashcard = Flashcard & { metadata: EntityMetadata };

export type ManagedKit = Omit<Kit, 'questions' | 'flashcards'> & {
  questions: ManagedQuestion[];
  flashcards: ManagedFlashcard[];
};

export type SectionState = 'idle' | 'generating' | 'failed';

export interface RegenerationStates {
  company_brief: SectionState;
  schedule: SectionState;
  flashcards: SectionState;
  questions: {
    category: Record<string, SectionState>;
  };
}
