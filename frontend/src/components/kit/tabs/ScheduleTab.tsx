import { Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { KitsAPI, useKit } from '@/api/routes/KitsAPI';
import RegenerateScheduleModal from '../modals/RegenerateScheduleModal';
import { ScheduleDayCard } from './ScheduleDayCard';

import { ManagedKit, ScheduleDay } from '@/types/kit';
import { RegenerationStates } from '@/api/routes/KitsAPI/types';

interface Props {
  kitData: ManagedKit;
  regenerationStates?: RegenerationStates;
}

const ScheduleTab = ({ kitData, regenerationStates }: Props) => {
  const { id } = useParams<{ id: string }>();
  const { mutateStatus, setOptimisticGenerating } = useKit(id);
  const isRegenerating = regenerationStates?.schedule === 'generating';
  const currentDays = kitData?.schedule?.days_available || kitData?.schedule?.days?.length || 5;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirmRegenerate = async (newDays: number) => {
    setIsModalOpen(false);
    if (!id) return;
    try {
      setOptimisticGenerating('schedule');
      await KitsAPI.regenerateSection(id, 'schedule', { study_days: newDays });
      await mutateStatus(); // Fetch real status
    } catch (e) {
      console.error('Failed to regenerate schedule', e);
      await mutateStatus(); // Revert on error
    }
  };
  if (!kitData || !kitData.schedule || !kitData.schedule.days) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 items-start">
        <div className="text-sm text-muted-foreground">
          The schedule allocates topics based on your available study days.
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          disabled={isRegenerating}
          className="text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 w-full sm:w-auto border border-border/10"
        >
          {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Regenerate Schedule
        </button>
      </div>
      <div className={`relative border-l-2 border-border/15 ml-3 md:ml-4 space-y-8 pb-4 ${isRegenerating ? 'opacity-50 pointer-events-none' : ''}`}>
        {kitData.schedule.days.map((day: ScheduleDay) => (
          <ScheduleDayCard key={day.day} day={day} questions={kitData.questions} />
        ))}
      </div>
      
      <RegenerateScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentDays={currentDays}
        onConfirm={handleConfirmRegenerate}
        isRegenerating={isRegenerating}
      />
    </div>
  );
};

export default ScheduleTab;
