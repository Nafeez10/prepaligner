export interface LLMProviderInfo {
  id: string;
  name: string;
}

export interface LLMProvidersResponse {
  providers: LLMProviderInfo[];
}
