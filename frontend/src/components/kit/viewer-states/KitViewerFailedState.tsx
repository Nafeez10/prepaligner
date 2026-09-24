import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Dispatch, SetStateAction } from 'react';
import { useLLMProviders } from '@/api/routes/LLMAPI';

interface KitViewerFailedStateProps {
  error: string | undefined;
  retryProvider: string;
  setRetryProvider: Dispatch<SetStateAction<string>>;
  isRetrying: boolean;
  onRetry: () => void;
}

const KitViewerFailedState = ({ 
  error, 
  retryProvider, 
  setRetryProvider, 
  isRetrying, 
  onRetry 
}: KitViewerFailedStateProps) => {
  const { providers, isLoading } = useLLMProviders();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto space-y-6 text-center">
      <div className="p-4 bg-destructive/10 rounded-full">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Generation Failed</h2>
        <p className="text-muted-foreground break-words max-w-xl">
          {error || 'An unknown error occurred during generation.'}
        </p>
      </div>
      <div className="bg-white/5 border border-white/10 p-4 rounded-md text-sm text-muted-foreground">
        This failure is often due to API rate limits or model changes from the AI provider. You can retry this exact generation job with a different AI model.
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm mt-4">
        <Select disabled={isRetrying || isLoading} value={retryProvider} onValueChange={setRetryProvider}>
          <SelectTrigger className="w-full bg-background/50">
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap w-full sm:w-auto" 
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Retry Job
        </Button>
      </div>
      
      <div className="pt-4 border-t border-white/10 w-full flex justify-center">
        <Link to="/dashboard">
          <Button variant="ghost">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default KitViewerFailedState;
