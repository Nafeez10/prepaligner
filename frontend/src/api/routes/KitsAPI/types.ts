export type CreateKitPayload = {
  company_url: string;
  job_description: string;
  role_name: string;
  study_days: number;
  provider?: string;
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

export interface KitSummary {
  _id: string;
  title: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
}

export interface KitDetail extends KitSummary {
  error?: string;
  kitData?: any;
  regeneration_states?: RegenerationStates;
}

export type KitStatusResponse = {
  _id: string;
  status: 'generating' | 'completed' | 'failed';
  regeneration_states?: RegenerationStates;
};
