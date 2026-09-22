export type EntityOrigin = 'generated' | 'manual' | 'regenerated';

export interface EntityMetadata {
  origin: EntityOrigin;
  is_pinned?: boolean;
  is_edited?: boolean;
  user_modified_at?: string | null;
}

export interface Requirement {
  id: string;
  text: string;
  kind: 'technical' | 'behavioural' | 'domain';
  priority: 'must' | 'nice';
}

export interface ManagedQuestion {
  id: string;
  requirement_ids: string[];
  category: 'technical' | 'behavioural' | 'system-design' | 'company-fit' | string;
  prompt: string;
  answer_outline: string;
  difficulty: 1 | 2 | 3;
  metadata: EntityMetadata;
}

export interface ManagedFlashcard {
  id: string;
  front: string;
  back: string;
  requirement_ids: string[];
  metadata: EntityMetadata;
}

export interface CompanyBrief {
  summary: string;
  what_they_do: string;
  sources: string[];
}

export interface RoleInfo {
  title: string;
  seniority: string;
  responsibilities: string[];
  requirements: Requirement[];
}

export interface ScheduleDay {
  day: number;
  focus: string;
  question_ids: string[];
  minutes: number;
}

export interface ManagedKit {
  id: string;
  source: {
    company: string;
    company_url: string;
    role: string;
    location: string;
    jd_chars: number;
    researched_at: string;
    pages_used: string[];
  };
  company_brief: CompanyBrief;
  role: RoleInfo;
  questions: ManagedQuestion[];
  flashcards: ManagedFlashcard[];
  schedule: {
    days_available: number;
    days: ScheduleDay[];
  };
  coverage: {
    uncovered_requirement_ids: string[];
    passes: number;
  };
}
