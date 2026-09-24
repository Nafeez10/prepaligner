import { Server } from 'lucide-react';

interface ColdStartToastProps {
  visible: boolean;
}

export const ColdStartToast = ({ visible }: ColdStartToastProps) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-auto sm:right-6 z-50 max-sm:p-2 animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div className="bg-card border sm:border border-border shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] sm:shadow-xl rounded-xl p-5 sm:p-4 pb-8 sm:pb-4 w-full sm:max-w-sm flex items-start gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-full flex-shrink-0 mt-0.5">
          <Server className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Waking up the server...</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Our backend is hosted on a free tier and may take 10-15 seconds to spin up on the first request. Hang tight!
          </p>
        </div>
      </div>
    </div>
  );
};
