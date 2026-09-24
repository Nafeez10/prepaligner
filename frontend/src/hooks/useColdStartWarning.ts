import { useState, useRef, useCallback, useEffect } from 'react';

export const useColdStartWarning = (delayMs: number = 3000) => {
  const [showWarning, setShowWarning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startWarningTimer = useCallback(() => {
    setShowWarning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, delayMs);
  }, [delayMs]);

  const stopWarningTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowWarning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { showWarning, startWarningTimer, stopWarningTimer };
};
