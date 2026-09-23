import { z } from 'zod';

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
