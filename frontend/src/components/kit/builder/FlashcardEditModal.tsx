import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { ManagedFlashcard } from '@/types/kit';

interface FlashcardEditModalProps {
  flashcard: ManagedFlashcard;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<ManagedFlashcard>) => void;
}

export const FlashcardEditModal = ({ flashcard, isOpen, onClose, onSave }: FlashcardEditModalProps) => {
  const [question, setQuestion] = useState(flashcard.front);
  const [answer, setAnswer] = useState(flashcard.back);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuestion(flashcard.front);
      setAnswer(flashcard.back);
    }
  }, [isOpen, flashcard]);

  const handleSave = () => {
    onSave({ front: question, back: answer });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-40px)] sm:w-full sm:max-w-[500px] rounded-xl max-md:p-5" onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="max-md:text-lg">Edit Flashcard</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Question</Label>
            <textarea 
              value={question} 
              onChange={e => setQuestion(e.target.value)} 
              className="w-full bg-background/50 rounded-md border border-input max-md:p-2.5 p-3 max-md:text-xs text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium min-h-[100px]" 
              placeholder="Flashcard Question" 
            />
          </div>
          <div className="space-y-2">
            <Label>Answer</Label>
            <textarea 
              value={answer} 
              onChange={e => setAnswer(e.target.value)} 
              className="w-full bg-background/50 rounded-md border border-input max-md:p-2.5 p-3 max-md:text-xs text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px]" 
              placeholder="Flashcard Answer" 
            />
          </div>
        </div>
        <DialogFooter className="max-md:flex max-md:flex-row max-md:justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="max-md:text-xs max-md:h-8">Cancel</Button>
          <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground max-md:text-xs max-md:h-8">
            <Check className="h-4 w-4 mr-1 max-md:h-3 max-md:w-3"/> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
