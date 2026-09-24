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
        <div className="flex items-start md:items-center gap-4">
          <Link to="/dashboard" className="shrink-0 mt-1 md:mt-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-white/10 hover:bg-white/5">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate whitespace-normal">{kit.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {kitData?.role?.title} • {kitData?.source?.company}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <Link to={`/kits/${id}/mock-interview`} className="w-full sm:w-auto flex">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 sm:gap-2 w-full h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm">
              <PlaySquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Mock Interview
            </Button>
          </Link>
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 w-full sm:w-auto h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="brief" className="w-full">
        <TabsList className="mb-6 inline-flex w-fit max-xl:w-full max-w-[100vw] sm:max-w-none justify-start overflow-x-auto whitespace-nowrap bg-secondary border border-border/10 p-1 rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsTrigger value="brief" className="px-4 md:px-6 py-2">Company Brief</TabsTrigger>
          <TabsTrigger value="questions" className="px-4 md:px-6 py-2">Question Bank</TabsTrigger>
          <TabsTrigger value="flashcards" className="px-4 md:px-6 py-2">Flashcards</TabsTrigger>
          <TabsTrigger value="schedule" className="px-4 md:px-6 py-2">Study Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="brief" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CompanyBriefTab kitData={kitData} regenerationStates={kit.regeneration_states} />
        </TabsContent>
        <TabsContent value="questions" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <QuestionsTab kitData={kitData} regenerationStates={kit.regeneration_states} />
        </TabsContent>
        <TabsContent value="flashcards" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <FlashcardsTab kitData={kitData} regenerationStates={kit.regeneration_states} />
        </TabsContent>
        <TabsContent value="schedule" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ScheduleTab kitData={kitData} regenerationStates={kit.regeneration_states} />
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
