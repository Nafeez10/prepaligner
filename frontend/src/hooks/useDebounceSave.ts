import { useEffect, useRef, useState } from 'react';
import { KitsAPI } from '../api/routes/KitsAPI';
import { toast } from 'sonner';

export function useDebounceSave(kitId: string | undefined, mutate: any) {
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Keep track of the latest data we want to save
  const pendingDataRef = useRef<any>(null);

  const triggerSave = (newKitData: any) => {
    if (!kitId) return;
    
    // Optimistically store the latest data to save
    pendingDataRef.current = newKitData;
    
    // Mutate the local SWR cache immediately for instantaneous UI updates across tabs
    mutate(
      (currentData: any) => currentData ? { ...currentData, kitData: newKitData } : currentData, 
      { revalidate: false }
    );
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsSaving(true);
    
    timeoutRef.current = setTimeout(async () => {
      if (!pendingDataRef.current) return;
      
      const dataToSave = pendingDataRef.current;
      pendingDataRef.current = null;
      
      try {
        await KitsAPI.updateKitData(kitId, dataToSave);
        setIsSaving(false);
      } catch (err) {
        console.error("Failed to save changes", err);
        toast.error("Failed to save your changes. Reverting to last saved state.");
        setIsSaving(false);
        // Force a revalidation to rollback to the server state
        await mutate();
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { triggerSave, isSaving };
}
