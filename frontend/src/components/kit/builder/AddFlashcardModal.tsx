import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-lg border-primary/50 relative rounded-xl">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="p-6 flex flex-col gap-4">
          <h3 className="text-xl font-semibold mb-2 text-primary">Add Flashcard</h3>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Front Text (Question)</label>
            <textarea 
              value={front} 
              onChange={e => setFront(e.target.value)} 
              className="w-full bg-background/50 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]" 
              placeholder="e.g. What is the main purpose of Docker?" 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Back Text (Answer)</label>
            <textarea 
              value={back} 
              onChange={e => setBack(e.target.value)} 
              className="w-full bg-background/50 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px]" 
              placeholder="e.g. Docker is a platform that uses OS-level virtualization to deliver software in packages called containers." 
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleConfirm} 
              className="bg-primary text-primary-foreground" 
              disabled={!front.trim() || !back.trim()}
            >
              Create Flashcard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFlashcardModal;
