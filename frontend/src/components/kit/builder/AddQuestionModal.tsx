import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Check } from 'lucide-react';
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-40px)] sm:w-full sm:max-w-[500px] rounded-xl max-md:p-5" onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="max-md:text-lg capitalize">Add {category.replace('-', ' ')} Question</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Question Prompt</Label>
            <textarea 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
              className="w-full bg-background/50 rounded-md border border-input max-md:p-2.5 p-3 max-md:text-xs text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium min-h-[80px]" 
              placeholder="e.g. How does garbage collection work in Node.js?" 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Answer Outline (Optional)</Label>
            <textarea 
              value={answerOutline} 
              onChange={e => setAnswerOutline(e.target.value)} 
              className="w-full bg-background/50 rounded-md border border-input max-md:p-2.5 p-3 max-md:text-xs text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px]" 
              placeholder="Key points to mention..." 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Difficulty</Label>
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
        </div>
        <DialogFooter className="max-md:flex max-md:flex-row max-md:justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="max-md:text-xs max-md:h-8">Cancel</Button>
          <Button size="sm" onClick={handleConfirm} disabled={!prompt.trim()} className="bg-primary text-primary-foreground max-md:text-xs max-md:h-8">
            <Check className="h-4 w-4 mr-1 max-md:h-3 max-md:w-3"/> Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuestionModal;
