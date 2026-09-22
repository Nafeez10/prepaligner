import { Loader2 } from 'lucide-react';

const KitViewerLoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Loading kit...</p>
    </div>
  );
};

export default KitViewerLoadingState;
