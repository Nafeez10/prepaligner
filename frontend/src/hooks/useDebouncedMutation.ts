import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseDebouncedMutationProps<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => void;
  onError?: (error: any, variables: TVariables) => void;
  onSuccess?: (data: TData, variables: TVariables) => void;
  debounceMs?: number;
}

export function useDebouncedMutation<TData, TVariables>({
  mutationFn,
  onMutate,
  onError,
  onSuccess,
  debounceMs = 1000,
}: UseDebouncedMutationProps<TData, TVariables>) {
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<TVariables | null>(null);

  const mutate = useCallback((variables: TVariables) => {
    // Optimistically apply changes if callback provided
    if (onMutate) {
      onMutate(variables);
    }
    
    pendingDataRef.current = variables;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsSaving(true);
    
    timeoutRef.current = setTimeout(async () => {
      if (!pendingDataRef.current) return;
      
      const dataToSave = pendingDataRef.current;
      pendingDataRef.current = null;
      
      try {
        const result = await mutationFn(dataToSave);
        setIsSaving(false);
        if (onSuccess) onSuccess(result, dataToSave);
      } catch (err) {
        console.error("Mutation failed", err);
        toast.error("Failed to save your changes.");
        setIsSaving(false);
        if (onError) onError(err, dataToSave);
      }
    }, debounceMs);
  }, [mutationFn, onMutate, onSuccess, onError, debounceMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { mutate, isSaving };
}
