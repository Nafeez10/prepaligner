import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useColdStartWarning } from '@/hooks/useColdStartWarning';

export const AuthSpinner = () => {
  const { showWarning, startWarningTimer } = useColdStartWarning(3000);

  useEffect(() => {
    startWarningTimer();
  }, [startWarningTimer]);

  return (
    <div className="flex flex-col items-center justify-center max-w-sm text-center p-6 min-h-[160px]">
      <Spinner size="lg" />
      
      {showWarning && (
        <div className="mt-8 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-500 bg-primary/10 border border-primary/20 text-primary rounded-xl p-4 flex flex-col items-center shadow-sm">
          <p className="text-sm font-semibold mb-1">
            Waking up the server...
          </p>
          <p className="text-xs opacity-90 leading-relaxed">
            Our backend is hosted on a free tier and may take 10-15 seconds to spin up on the first request. Hang tight!
          </p>
        </div>
      )}
    </div>
  );
};
