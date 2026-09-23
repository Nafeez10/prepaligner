import { toast } from 'sonner';
import { RegenerationStates } from '@/api/routes/KitsAPI/types';

/**
 * Normalizes snake_case string keys into Title Case for user-facing UI display.
 */
const formatSectionName = (key: string): string => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Compares previous and current regeneration states to trigger UI toast notifications.
 * Decouples notification side-effects from the core data fetching hook.
 * 
 * @param prevStates - The previous state of regeneration polling
 * @param currStates - The new state of regeneration polling
 */
export const notifyRegenerationTransitions = (
  prevStates: RegenerationStates | undefined,
  currStates: RegenerationStates | undefined
): void => {
  if (!prevStates || !currStates) return;

  // 1. Process standard root-level sections
  const coreSections: (keyof Omit<RegenerationStates, 'questions'>)[] = [
    'company_brief',
    'schedule',
    'flashcards',
  ];

  coreSections.forEach((section) => {
    const prevState = prevStates[section];
    const currState = currStates[section];

    if (prevState === 'generating' && currState !== 'generating') {
      const displayName = formatSectionName(section);
      if (currState === 'idle') {
        toast.success(`${displayName} regenerated successfully`);
      } else if (currState === 'failed') {
        toast.error(`Failed to regenerate ${displayName.toLowerCase()}`);
      }
    }
  });

  // 2. Process nested question categories
  const prevCategories = prevStates.questions?.category || {};
  const currCategories = currStates.questions?.category || {};

  Object.keys(prevCategories).forEach((categoryName) => {
    const prevState = prevCategories[categoryName];
    const currState = currCategories[categoryName];

    if (prevState === 'generating' && currState !== 'generating') {
      if (currState === 'idle') {
        toast.success(`Category "${categoryName}" regenerated successfully`);
      } else if (currState === 'failed') {
        toast.error(`Failed to regenerate category "${categoryName}"`);
      }
    }
  });
};
