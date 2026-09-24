import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';
import { ManagedQuestion } from '@/types/kit';
import { QUESTION_LEVEL_OPTIONS } from '@/utils/constants/questionLevelOptions';

interface QuestionEditModalProps {
  question: ManagedQuestion;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<ManagedQuestion>) => void;
}

export const QuestionEditModal = ({ question, isOpen, onClose, onSave }: QuestionEditModalProps) => {
  const [prompt, setPrompt] = useState(question.prompt);
  const [answerOutline, setAnswerOutline] = useState(question.answer_outline);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(question.difficulty);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrompt(question.prompt);
      setAnswerOutline(question.answer_outline);
      setDifficulty(question.difficulty);
    }
  }, [isOpen, question]);

  const handleSave = () => {
    onSave({ prompt, answer_outline: answerOutline, difficulty });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-40px)] sm:w-full sm:max-w-[500px] rounded-xl max-md:p-5" onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="max-md:text-lg">Edit Question</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Question Prompt</Label>
            <textarea 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
              className="w-full bg-background/50 rounded-md border border-input max-md:p-2.5 p-3 max-md:text-xs text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium min-h-[80px]" 
              placeholder="Question prompt" 
            />
          </div>
          <div className="space-y-2">
            <Label>Answer Outline</Label>
            <textarea 
              value={answerOutline} 
              onChange={e => setAnswerOutline(e.target.value)} 
              className="w-full bg-background/50 rounded-md border border-input max-md:p-2.5 p-3 max-md:text-xs text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px]" 
              placeholder="Answer outline" 
            />
          </div>
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select 
              value={difficulty.toString()} 
              onValueChange={v => setDifficulty(Number(v) as 1 | 2 | 3)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
