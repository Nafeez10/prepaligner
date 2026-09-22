type ExternalDataSourceResult = {
  source: string;
  interviewQuestions: string[];
  interviewExperiences: string[];
  companyInsights: string[];
  confidence: 'high' | 'medium' | 'low';
};

interface IExternalDataSource {
  readonly sourceName: string;
  search(companyName: string, roleName: string): Promise<ExternalDataSourceResult>;
}

type AggregatedResearchResult = {
  contextString: string;
  sources: string[];
  totalQuestions: number;
  totalExperiences: number;
};

export type { ExternalDataSourceResult, IExternalDataSource, AggregatedResearchResult };
