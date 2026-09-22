export const CATEGORIES = [
  'technical', 
  'behavioural', 
  'system-design', 
  'company-fit'
] as const;

export type CategoryType = typeof CATEGORIES[number];
