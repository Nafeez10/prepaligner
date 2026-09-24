import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { ManagedQuestion } from '@/types/kit';

interface AddQuestionModalProps {
  isOpen: boolean;
  category: string | null;
  onClose: () => void;
  onConfirm: (question: Omit<ManagedQuestion, 'id'>) => void;
}

const AddQuestionModal = ({ isOpen, category, onClose, onConfirm }: AddQuestionModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [answerOutline, setAnswerOutline] = useState('');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setAnswerOutline('');
      setDifficulty(1);
    }
  }, [isOpen]);

  if (!isOpen || !category) return null;

  const handleConfirm = () => {
    if (!prompt.trim()) return;

    onConfirm({
      category,
      prompt: prompt.trim(),
      answer_outline: answerOutline.trim() || 'No answer outline provided.',
      difficulty,
      requirement_ids: [],
      metadata: { origin: 'manual', is_edited: true, is_pinned: true }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="bg-card border-border/15 shadow-sm w-full max-w-lg border-primary/50 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="p-6 flex flex-col gap-4">
          <h3 className="text-xl font-semibold mb-2 capitalize text-primary">
            Add {category.replace('-', ' ')} Question
          </h3>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Question Prompt</label>
            <textarea 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
              className="w-full bg-background/50 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]" 
              placeholder="e.g. How does garbage collection work in Node.js?" 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Answer Outline (Optional)</label>
            <textarea 
              value={answerOutline} 
              onChange={e => setAnswerOutline(e.target.value)} 
              className="w-full bg-background/50 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px]" 
              placeholder="Key points to mention..." 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Difficulty Level</label>
            <Select 
              value={difficulty.toString()} 
              onValueChange={v => setDifficulty(Number(v) as 1 | 2 | 3)}
            >
              <SelectTrigger className="w-full bg-background/50">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Level 1 (Easy)</SelectItem>
                <SelectItem value="2">Level 2 (Medium)</SelectItem>
                <SelectItem value="3">Level 3 (Hard)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleConfirm} 
              className="bg-primary text-primary-foreground" 
              disabled={!prompt.trim()}
            >
              Create Question
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AddQuestionModal;
