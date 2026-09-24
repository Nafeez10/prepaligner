import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const KitViewerGeneratingState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">AI Pipeline is Running...</h2>
        <p className="text-muted-foreground">Crawling, analyzing, and generating your custom prep kit.</p>
        <p className="text-sm text-primary animate-pulse pt-2">This usually takes 1-2 minutes.</p>
      </div>
      <div className="pt-8 flex flex-col items-center">
        <p className="text-sm text-muted-foreground mb-4">While you wait, you can explore your other kits:</p>
        <Link to="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default KitViewerGeneratingState;
