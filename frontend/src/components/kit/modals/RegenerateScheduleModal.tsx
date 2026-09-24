import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarClock, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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

  const isSameTimeline = studyDays === currentDays;
  const isInvalid = studyDays < 1 || studyDays > 90 || isNaN(studyDays);

  const canSubmit = !isSameTimeline && !isInvalid && !isRegenerating;

  const handleConfirm = () => {
    if (canSubmit) {
      onConfirm(studyDays);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isRegenerating) onClose();
    }}>
      <DialogContent className="w-[calc(100%-40px)] sm:w-full sm:max-w-md rounded-xl max-md:p-5" onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <CalendarClock className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl max-md:text-lg">Regenerate Schedule</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-2 text-left">
            Enter a new timeline (in days) to dynamically recalculate and redistribute the topics across your new schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
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
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
          </div>

          {isSameTimeline && (
            <div className="flex items-start gap-2 text-destructive text-xs p-3 bg-destructive/10 rounded-md border border-destructive/20">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>This is already your current timeline. Please enter a different number of days.</p>
            </div>
          )}

          {isInvalid && !isSameTimeline && (
            <div className="flex items-start gap-2 text-destructive text-xs p-3 bg-destructive/10 rounded-md border border-destructive/20">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>Please enter a valid number of days (1 to 90).</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isRegenerating}
            className="bg-transparent border-input hover:bg-accent hover:text-accent-foreground"
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
      </DialogContent>
    </Dialog>
  );
};

export default RegenerateScheduleModal;
