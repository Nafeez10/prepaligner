import { Server } from 'lucide-react';

interface ColdStartToastProps {
  visible: boolean;
}

export const ColdStartToast = ({ visible }: ColdStartToastProps) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div className="bg-card border border-border shadow-xl rounded-xl p-4 max-w-sm flex items-start gap-3">
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
