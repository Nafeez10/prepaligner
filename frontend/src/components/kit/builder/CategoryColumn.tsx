import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Code, Users, Plus, Loader2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ManagedQuestion } from '@/types/kit';
import SortableQuestionCard from './SortableQuestionCard';

interface CategoryColumnProps {
  categoryId: string;
  items: ManagedQuestion[];
  onAdd: (category: string) => void;
  onUpdate: (qId: string, updates: Partial<ManagedQuestion>) => void;
  onDelete: (qId: string) => void;
  onTogglePin: (qId: string) => void;
  onRegenerate: (category: string) => void;
  isRegenerating: boolean;
}

const CategoryColumn = ({ categoryId, items, onAdd, onUpdate, onDelete, onTogglePin, onRegenerate, isRegenerating }: CategoryColumnProps) => {
  const { setNodeRef } = useDroppable({ id: categoryId });

  return (
    <div className="bg-secondary p-6 max-md:p-4 rounded-xl border border-border/10 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between items-start">
        <h2 className="text-lg font-bold capitalize text-primary flex items-center gap-2">
          {categoryId === 'technical' && <Code className="h-5 w-5" />}
          {(categoryId === 'behavioural' || categoryId === 'company-fit') && <Users className="h-5 w-5" />}
          {categoryId === 'system-design' && <Brain className="h-5 w-5" />}
          {categoryId.replace('-', ' ')}
        </h2>
        <div className="flex gap-2 max-sm:self-end">
          <Button variant="outline" size="sm" onClick={() => onRegenerate(categoryId)} disabled={isRegenerating} className="bg-background/50 hover:bg-secondary max-sm:px-2">
            {isRegenerating ? <Loader2 className="h-4 w-4 sm:mr-1 animate-spin" /> : <Brain className="h-4 w-4 sm:mr-1" />}
            <span className="max-sm:hidden">{isRegenerating ? "Regenerating..." : "Regenerate"}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAdd(categoryId)} disabled={isRegenerating} className="bg-background/50 hover:bg-secondary max-sm:px-2">
            <Plus className="h-4 w-4 sm:mr-1" /> <span className="max-sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <div ref={setNodeRef} className={isRegenerating ? 'opacity-50 pointer-events-none' : ''}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[50px]">
            {items.map(q => (
              <SortableQuestionCard
                key={q.id}
                question={q}
                onUpdate={(updates) => onUpdate(q.id, updates)}
                onDelete={() => onDelete(q.id)}
                onTogglePin={() => onTogglePin(q.id)}
              />
            ))}
            {items.length === 0 && (
              <div className="text-sm text-muted-foreground italic p-4 text-center border border-dashed border-border/20 rounded-lg">
                Drag questions here
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default memo(CategoryColumn);
