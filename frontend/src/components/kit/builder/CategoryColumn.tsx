import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Code, Users, Plus } from 'lucide-react';
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
    <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold capitalize text-primary flex items-center gap-2">
          {categoryId === 'technical' && <Code className="h-5 w-5" />}
          {(categoryId === 'behavioural' || categoryId === 'company-fit') && <Users className="h-5 w-5" />}
          {categoryId === 'system-design' && <Brain className="h-5 w-5" />}
          {categoryId.replace('-', ' ')}
        </h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onRegenerate(categoryId)} disabled={isRegenerating}>
            <Brain className={`h-4 w-4 ${isRegenerating ? 'animate-pulse' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAdd(categoryId)} disabled={isRegenerating}>
            <Plus className="h-4 w-4 mr-1" /> Add
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
              <div className="text-sm text-muted-foreground italic p-4 text-center border border-dashed border-white/10 rounded-lg">
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
