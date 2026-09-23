import { useEffect, useRef } from 'react';
import useSWR from 'swr';
import { swrFetcher } from '../../fetcher/swrFetcher';
import { notifyRegenerationTransitions } from '@/utils/regenerationNotifier';
import { KitSummary, KitDetail, KitStatusResponse, RegenerationStates } from './types';

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

const isAnySectionGenerating = (s?: RegenerationStates): boolean => {
  if (!s) return false;
  return (
    s.company_brief === 'generating' ||
    s.schedule === 'generating' ||
    s.flashcards === 'generating' ||
    Object.values(s.questions?.category || {}).some((v) => v === 'generating')
  );
};

export const useKit = (id?: string) => {
  const { data: kit, error, isLoading, mutate: mutateKit } = useSWR<KitDetail>(
    id ? `/kits/${id}` : null,
    swrFetcher,
    {
      refreshInterval: (data) => (data?.status === 'generating' ? 3000 : 0),
    }
  );

  // Lightweight status polling — only kicks in when a section is regenerating
  const { data: statusData, mutate: mutateStatus } = useSWR<KitStatusResponse>(
    id ? `/kits/${id}/status` : null,
    swrFetcher,
    {
      refreshInterval: (data) => {
        if (kit?.status === 'generating') return 0; // Main kit hook already polling
        if (isAnySectionGenerating(data?.regeneration_states)) return 3000;
        if (!data && isAnySectionGenerating(kit?.regeneration_states)) return 3000;
        return 0;
      },
    }
  );

  // When any section transitions from 'generating' → not 'generating', fetch the full kit data
  const prevStates = useRef<RegenerationStates | undefined>();
  useEffect(() => {
    const current = statusData?.regeneration_states;
    if (!prevStates.current && current) {
      prevStates.current = current;
      return;
    }
    if (current && prevStates.current) {
      const wasGenerating = isAnySectionGenerating(prevStates.current);
      const isNowGenerating = isAnySectionGenerating(current);
      if (wasGenerating && !isNowGenerating) {
        // A section just finished — pull fresh kitData
        mutateKit();
      }

      // Delegate UI side-effects to the utility function
      notifyRegenerationTransitions(prevStates.current, current);

      prevStates.current = current;
    }
  }, [statusData, mutateKit]);

  const setOptimisticGenerating = (section: 'company_brief' | 'schedule' | 'flashcards' | 'category', categoryName?: string) => {
    mutateStatus((current: any) => {
      const newStates = JSON.parse(JSON.stringify(current?.regeneration_states || {}));
      if (section === 'category' && categoryName) {
        if (!newStates.questions) newStates.questions = { category: {} };
        if (!newStates.questions.category) newStates.questions.category = {};
        newStates.questions.category[categoryName] = 'generating';
      } else {
        newStates[section] = 'generating';
      }
      return { ...current, regeneration_states: newStates };
    }, { revalidate: false });
  };

  // Merge: always prefer the live status data for regeneration_states so UI is up to date
  const mergedKit = kit
    ? { ...kit, regeneration_states: statusData?.regeneration_states ?? kit.regeneration_states }
    : undefined;

  return {
    kit: mergedKit,
    error,
    isLoading,
    mutate: mutateKit,
    mutateStatus,
    setOptimisticGenerating,
  };
};
