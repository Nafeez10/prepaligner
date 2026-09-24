import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Check } from 'lucide-react';
import { ManagedFlashcard } from '@/types/kit';

interface AddFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (flashcard: Omit<ManagedFlashcard, 'id'>) => void;
}

const AddFlashcardModal = ({ isOpen, onClose, onConfirm }: AddFlashcardModalProps) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFront('');
      setBack('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!front.trim() || !back.trim()) return;

    onConfirm({
      front: front.trim(),
      back: back.trim(),
      requirement_ids: [],
      metadata: { origin: 'manual', is_edited: true, is_pinned: true }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-40px)] sm:w-full sm:max-w-[500px] rounded-xl max-md:p-5" onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="max-md:text-lg">Add Flashcard</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Front Text (Question)</Label>
            <textarea 
              value={front} 
              onChange={e => setFront(e.target.value)} 
              className="w-full bg-background/50 rounded-md border border-input max-md:p-2.5 p-3 max-md:text-xs text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium min-h-[80px]" 
              placeholder="e.g. What is the main purpose of Docker?" 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Back Text (Answer)</Label>
            <textarea 
              value={back} 
              onChange={e => setBack(e.target.value)} 
              className="w-full bg-background/50 rounded-md border border-input max-md:p-2.5 p-3 max-md:text-xs text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px]" 
              placeholder="e.g. Docker is a platform that uses OS-level virtualization to deliver software in packages called containers." 
            />
          </div>
        </div>
        <DialogFooter className="max-md:flex max-md:flex-row max-md:justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="max-md:text-xs max-md:h-8">Cancel</Button>
          <Button size="sm" onClick={handleConfirm} disabled={!front.trim() || !back.trim()} className="bg-primary text-primary-foreground max-md:text-xs max-md:h-8">
            <Check className="h-4 w-4 mr-1 max-md:h-3 max-md:w-3"/> Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFlashcardModal;
