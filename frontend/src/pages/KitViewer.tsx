import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useKit, KitsAPI } from '@/api/routes/KitsAPI';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PlaySquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import CompanyBriefTab from '@/components/kit/tabs/CompanyBriefTab';
import QuestionsTab from '@/components/kit/tabs/QuestionsTab';
import FlashcardsTab from '@/components/kit/tabs/FlashcardsTab';
import ScheduleTab from '@/components/kit/tabs/ScheduleTab';

import KitViewerLoadingState from '@/components/kit/viewer-states/KitViewerLoadingState';
import KitViewerErrorState from '@/components/kit/viewer-states/KitViewerErrorState';
import KitViewerGeneratingState from '@/components/kit/viewer-states/KitViewerGeneratingState';
import KitViewerFailedState from '@/components/kit/viewer-states/KitViewerFailedState';
import WarningModal from '@/components/ui/warning-modal';

const KitViewer = () => {
  const { id } = useParams<{ id: string }>();
  const { kit, error, isLoading, mutate } = useKit(id);
  const navigate = useNavigate();
  
  const [retryProvider, setRetryProvider] = useState('gemini');
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteKit = async () => {
    if (!id) return;
    
    try {
      await KitsAPI.deleteKit(id);
      toast.success('Kit deleted successfully');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete kit');
    }
  };

  const handleRetry = async () => {
    if (!id) return;
    try {
      setIsRetrying(true);
      await KitsAPI.retry(id, retryProvider);
      await mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading) {
    return <KitViewerLoadingState />;
  }

  if (error || !kit) {
    return <KitViewerErrorState />;
  }

  if (kit.status === 'generating') {
    return <KitViewerGeneratingState />;
  }

  if (kit.status === 'failed') {
    return (
      <KitViewerFailedState 
        error={kit.error}
        retryProvider={retryProvider}
        setRetryProvider={setRetryProvider}
        isRetrying={isRetrying}
        onRetry={handleRetry}
      />
    );
  }

  const { kitData } = kit;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-white/10 hover:bg-white/5">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{kit.title}</h1>
            <p className="text-muted-foreground mt-1">
              {kitData?.role?.title} • {kitData?.source?.company}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Link to={`/kits/${id}/mock-interview`}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 w-full">
              <PlaySquare className="h-4 w-4" />
              Mock Interview
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="brief" className="w-full">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto bg-black/20 border border-white/5 p-1 h-auto">
          <TabsTrigger value="brief" className="px-6 py-2">Company Brief</TabsTrigger>
          <TabsTrigger value="questions" className="px-6 py-2">Question Bank</TabsTrigger>
          <TabsTrigger value="flashcards" className="px-6 py-2">Flashcards</TabsTrigger>
          <TabsTrigger value="schedule" className="px-6 py-2">Study Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="brief" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CompanyBriefTab kitData={kitData} />
        </TabsContent>
        <TabsContent value="questions" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <QuestionsTab kitData={kitData} />
        </TabsContent>
        <TabsContent value="flashcards" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <FlashcardsTab kitData={kitData} />
        </TabsContent>
        <TabsContent value="schedule" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ScheduleTab kitData={kitData} />
        </TabsContent>
      </Tabs>

      <WarningModal
        isOpen={isDeleteDialogOpen}
        title="Delete Kit"
        description="Are you sure you want to delete this kit? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteKit}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default KitViewer;
