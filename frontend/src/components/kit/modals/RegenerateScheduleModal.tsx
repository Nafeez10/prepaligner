import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, CalendarClock, AlertCircle } from 'lucide-react';

interface RegenerateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDays: number;
  onConfirm: (newDays: number) => void;
  isRegenerating: boolean;
}

const RegenerateScheduleModal = ({
  isOpen,
  onClose,
  currentDays,
  onConfirm,
  isRegenerating,
}: RegenerateScheduleModalProps) => {
  const [studyDays, setStudyDays] = useState<number>(currentDays);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStudyDays(currentDays);
    }
  }, [isOpen, currentDays]);

  if (!isOpen) return null;

  const isSameTimeline = studyDays === currentDays;
  const isInvalid = studyDays < 1 || isNaN(studyDays);
  
  const canSubmit = !isSameTimeline && !isInvalid && !isRegenerating;

  const handleConfirm = () => {
    if (canSubmit) {
      onConfirm(studyDays);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="glass-card w-full max-w-md relative overflow-hidden border-white/10">
        <button 
          onClick={onClose}
          disabled={isRegenerating}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <CalendarClock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">Regenerate Schedule</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Enter a new timeline (in days) to dynamically recalculate and redistribute the topics across your new schedule.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="studyDaysModal" className="text-sm font-medium">
                Study Days
              </label>
              <input
                id="studyDaysModal"
                type="number"
                min="1"
                max="90"
                value={studyDays}
                onChange={(e) => setStudyDays(parseInt(e.target.value))}
                disabled={isRegenerating}
                className="w-full px-3 py-2 bg-background border border-white/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
            </div>

            {isSameTimeline && (
              <div className="flex items-start gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-md border border-destructive/20">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>This is already your current timeline. Please enter a different number of days.</p>
              </div>
            )}
            
            {isInvalid && !isSameTimeline && (
              <div className="flex items-start gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-md border border-destructive/20">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>Please enter a valid number of days (1 or more).</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isRegenerating}
              className="bg-transparent border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!canSubmit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Regenerate
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RegenerateScheduleModal;
