import { Accordion, AccordionItem, AccordionContent } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Pin, PinOff, GripVertical, Edit2, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ManagedQuestion } from '@/types/kit';
import { useState, memo, MouseEvent } from 'react';
import { QuestionEditModal } from './QuestionEditModal';

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const isPinned = !!question.metadata?.is_pinned;

  const handleEditClick = (e: MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const getDifficultyColor = (diff: number) => {
    if (diff === 1) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (diff === 2) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    return 'bg-red-500/10 text-red-500 border-red-500/20';
  };

  return (
    <>
      <Card ref={setNodeRef} style={style} className={`hover:-translate-y-1 hover:shadow-md transition-all duration-300 group ${isPinned ? 'border-accent' : ''}`}>
        <Accordion type="single" collapsible value={isExpanded ? "item-1" : ""} onValueChange={(val) => setIsExpanded(!!val)}>
          <AccordionItem value="item-1" className="border-b-0">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
              <div className="flex items-start gap-3 w-full">
                {/* Desktop Grip */}
                <div {...attributes} {...listeners} className="mt-1 flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity max-md:hidden" onClick={e => e.stopPropagation()}>
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1 w-full">
                  <div className="flex items-center justify-between gap-2 mb-2 w-full">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(question.difficulty)}`}>
                      Level {question.difficulty}
                    </span>
                    {/* Mobile Grip */}
                    <div {...attributes} {...listeners} className="md:hidden flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-opacity" onClick={e => e.stopPropagation()}>
                      <GripVertical className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-sm md:text-base font-medium leading-snug">{question.prompt}</h3>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center justify-end max-sm:w-full gap-2 max-md:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground max-md:bg-secondary/50" onClick={handleEditClick}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive max-md:bg-secondary/50" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className={`rounded-full h-8 w-8 max-md:bg-secondary/50 ${isPinned ? 'text-primary bg-primary/10 opacity-100' : 'text-muted-foreground hover:text-foreground'}`} onClick={(e) => { e.stopPropagation(); onTogglePin(); }}>
                  {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                </Button>
                <div className="opacity-100 pointer-events-none ml-2">
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </div>
              </div>
            </div>

            <AccordionContent className="pt-2 pb-4 border-none">
              <div className="px-4">
                <div className="mt-2 p-4 rounded-lg bg-secondary border border-border/10">
                  <h4 className="text-xs md:text-sm font-semibold text-brand-navy mb-2">Ideal Answer Outline</h4>
                  <div className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {question.answer_outline}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      <QuestionEditModal
        question={question}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={onUpdate}
      />
    </>
  );
};

export default memo(SortableQuestionCard);
