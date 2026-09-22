import useSWR from 'swr';
import { swrFetcher } from '../../fetcher/swrFetcher';
import { LLMProvidersResponse } from './types';

export const useLLMProviders = () => {
  const { data, error, isLoading } = useSWR<LLMProvidersResponse>('/llm/providers', swrFetcher, {
    revalidateOnFocus: false,
  });
  
  return {
    providers: data?.providers || [],
    error,
    isLoading,
  };
};
