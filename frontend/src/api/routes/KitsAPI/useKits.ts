import useSWR from 'swr';
import { swrFetcher } from '../../fetcher/swrFetcher';
import { KitSummary, KitDetail, KitStatusResponse } from './types';

export const useKits = () => {
  const { data, error, isLoading, mutate } = useSWR<KitSummary[]>('/kits', swrFetcher);

  return {
    kits: data ?? [],
    error,
    isLoading,
    mutate,
  };
};

export const useKitStatus = (id: string, initialStatus: KitStatusResponse['status']) => {
  const shouldPoll = initialStatus === 'generating';

  const { data } = useSWR<KitStatusResponse>(
    shouldPoll ? `/kits/${id}/status` : null,
    swrFetcher,
    {
      refreshInterval: shouldPoll ? 3000 : 0,
    }
  );

  // If we're not polling, return the initial status passed in from the parent list
  return {
    status: data?.status ?? initialStatus,
  };
};

export const useKit = (id?: string) => {
  const { data, error, isLoading, mutate } = useSWR<KitDetail>(
    id ? `/kits/${id}` : null,
    swrFetcher,
    {
      refreshInterval: (data) => (data?.status === 'generating' ? 3000 : 0) // if it is 0 the refresh polling stops
    }
  );

  return {
    kit: data,
    error,
    isLoading,
    mutate,
  };
};
