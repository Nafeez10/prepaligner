import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const KitViewerErrorState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-destructive space-y-4">
      <AlertCircle className="h-12 w-12" />
      <p>Failed to load kit. It may not exist or you don't have access.</p>
      <Link to="/dashboard">
        <Button variant="outline">Back to Dashboard</Button>
      </Link>
    </div>
  );
};

export default KitViewerErrorState;
