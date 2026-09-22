import { useState, memo, MouseEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Pin, PinOff, GripVertical, Edit2, Trash2, Check } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ManagedQuestion } from '@/types/kit';

interface SortableQuestionCardProps {
  question: ManagedQuestion;
  onUpdate: (updates: Partial<ManagedQuestion>) => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

const SortableQuestionCard = ({ question, onUpdate, onDelete, onTogglePin }: SortableQuestionCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [prompt, setPrompt] = useState(question.prompt);
  const [answerOutline, setAnswerOutline] = useState(question.answer_outline);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(question.difficulty);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const isPinned = !!question.metadata?.is_pinned;

  const handleSave = (e: MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    onUpdate({ prompt, answer_outline: answerOutline, difficulty });
  };

  const getDifficultyColor = (diff: number) => {
    if (diff === 1) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (diff === 2) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    return 'bg-red-500/10 text-red-500 border-red-500/20';
  };

  if (isEditing) {
    return (
      <Card ref={setNodeRef} style={style} className="glass-card border-primary/50">
        <div className="p-4 flex flex-col gap-3">
          <textarea 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)} 
            className="bg-background/50 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium" 
            placeholder="Question prompt" 
          />
          <textarea 
            value={answerOutline} 
            onChange={e => setAnswerOutline(e.target.value)} 
            className="bg-background/50 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]" 
            placeholder="Answer outline" 
          />
          <div className="flex items-center justify-between">
            <select 
              value={difficulty} 
              onChange={e => setDifficulty(Number(e.target.value) as 1 | 2 | 3)} 
              className="bg-background/50 rounded p-1 text-sm border-none focus:ring-1 focus:ring-primary"
            >
              <option value={1}>Level 1 (Easy)</option>
              <option value={2}>Level 2 (Medium)</option>
              <option value={3}>Level 3 (Hard)</option>
            </select>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground">
                <Check className="h-4 w-4 mr-1"/> Save
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card ref={setNodeRef} style={style} className={`glass-card transition-all duration-200 group ${isPinned ? 'border-primary/50' : ''}`}>
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/5" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start gap-3">
          <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(question.difficulty)}`}>
                Level {question.difficulty}
              </span>
            </div>
            <h3 className="text-lg font-medium leading-snug">{question.prompt}</h3>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className={`rounded-full h-8 w-8 ${isPinned ? 'text-primary bg-primary/10 opacity-100' : 'text-muted-foreground hover:text-foreground'}`} onClick={(e) => { e.stopPropagation(); onTogglePin(); }}>
            {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
          </Button>
          <div className="opacity-100 pointer-events-none ml-2">
            {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <CardContent className="pt-0 pb-4 ml-8">
          <div className="mt-2 p-4 rounded-lg bg-black/40 border border-white/5 border-l-2 border-l-primary/50">
            <h4 className="text-sm font-semibold text-primary mb-2">Ideal Answer Outline</h4>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {question.answer_outline}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default memo(SortableQuestionCard);
