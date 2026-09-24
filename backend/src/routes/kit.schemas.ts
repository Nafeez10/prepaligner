import { z } from 'zod';
import { KitSchema, QuestionSchema, FlashcardSchema } from '../types/schemas';

export const CreateKitSchema = z.object({
  company_url: z.string().url('company_url must be a valid URL'),
  role_name: z.string().min(1, 'role_name is required'),
  job_description: z.string().min(10, 'job_description must be at least 10 characters'),
  study_days: z.coerce
    .number()
    .int('study_days must be an integer')
    .min(1, 'study_days must be at least 1')
    .max(90, 'study_days cannot exceed 90'),
  provider: z.enum(['gemini', 'groq', 'cohere']).default('gemini'),
});

export const RetryKitSchema = z.object({
  provider: z.enum(['gemini', 'groq', 'cohere']).default('gemini'),
});

export const UpdateKitDataSchema = z.object({
  kitData: z.record(z.string(), z.unknown()),
});

export const RegenerateSectionSchema = z.object({
  section: z.enum(['company_brief', 'schedule', 'category', 'flashcards']),
  payload: z
    .object({
      category: z.enum(['technical', 'behavioural', 'system-design', 'company-fit']).optional(),
      provider: z.string().optional(),
      study_days: z.number().optional(),
    })
    .optional(),
});

// Granular Update Schemas
export const UpdateCompanyBriefSchema = z.object({
  company_brief: KitSchema.shape.company_brief.partial(),
});

export const UpdateRoleSchema = z.object({
  role: KitSchema.shape.role.partial(),
});

export const CreateQuestionSchema = z.object({
  question: QuestionSchema,
});

export const UpdateQuestionSchema = z.object({
  question: QuestionSchema.partial(),
});

export const UpdateQuestionsArraySchema = z.object({
  questions: z.array(QuestionSchema),
});

export const CreateFlashcardSchema = z.object({
  flashcard: FlashcardSchema,
});

export const UpdateFlashcardSchema = z.object({
  flashcard: FlashcardSchema.partial(),
});

export const UpdateFlashcardsArraySchema = z.object({
  flashcards: z.array(FlashcardSchema),
});
