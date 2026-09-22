export type CreateKitPayload = {
  company_url: string;
  job_description: string;
  role_name: string;
  study_days: number;
  provider?: string;
};

export interface KitSummary {
  _id: string;
  title: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
}

export interface KitDetail extends KitSummary {
  error?: string;
  kitData?: any;
}

export type KitStatusResponse = {
  _id: string;
  status: 'generating' | 'completed' | 'failed';
};
