import { useEffect } from 'react';
import { useColdStartWarning } from '@/hooks/useColdStartWarning';
import { ColdStartToast } from '@/components/ui/cold-start-toast';

export const AuthSpinner = () => {
  const { showWarning, startWarningTimer } = useColdStartWarning(3000);

  useEffect(() => {
    startWarningTimer();
  }, [startWarningTimer]);

  return (
    <div className="flex flex-col items-center justify-center max-w-sm p-6 min-h-[160px]">
      <div className="flex flex-col items-center justify-center gap-6 animate-pulse">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Prep Aligner Logo" className="h-10 w-10 rounded-md shadow-sm" />
          <span className="font-bold text-3xl text-foreground tracking-tight">Prep Aligner</span>
        </div>
      </div>

      <ColdStartToast visible={showWarning} />
    </div>
  );
};
