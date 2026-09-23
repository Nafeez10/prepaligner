import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { KitsAPI, useKit } from '@/api/routes/KitsAPI';
import { useDebounceSave } from '@/hooks/useDebounceSave';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ManagedQuestion, ManagedKit } from '@/types/kit';
import { CATEGORIES } from '@/constants/kitConstants';
import CategoryColumn from '../builder/CategoryColumn';
import AddQuestionModal from '../builder/AddQuestionModal';

import { RegenerationStates } from '@/api/routes/KitsAPI/types';

const QuestionsTab = ({ kitData, regenerationStates }: { kitData: ManagedKit, regenerationStates?: RegenerationStates }) => {
  const { id } = useParams<{ id: string }>();
  const { mutate, mutateStatus, setOptimisticGenerating } = useKit(id);
  const { triggerSave, isSaving } = useDebounceSave(id, mutate);
  
  const [items, setItems] = useState<ManagedQuestion[]>([]);
  const [addModalCategory, setAddModalCategory] = useState<string | null>(null);

  useEffect(() => {
    setItems(kitData?.questions || []);
  }, [kitData?.questions]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const saveToBackend = useCallback((newItems: ManagedQuestion[]) => {
    if (!kitData) return;
    const updatedKitData = { ...kitData, questions: newItems };
    triggerSave(updatedKitData);
  }, [kitData, triggerSave]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    if ((CATEGORIES as readonly string[]).includes(overId)) {
      setItems(prev => {
        const activeIndex = prev.findIndex(q => q.id === activeId);
        if (activeIndex > -1 && prev[activeIndex].category !== overId) {
          const newItems = [...prev];
          newItems[activeIndex] = { ...newItems[activeIndex], category: overId };
          return newItems;
        }
        return prev;
      });
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    setItems(prev => {
      let newItems = [...prev];
      
      const activeIndex = newItems.findIndex(q => q.id === activeId);
      if (activeIndex === -1) return prev;

      if ((CATEGORIES as readonly string[]).includes(overId)) {
        if (newItems[activeIndex].category !== overId) {
          newItems[activeIndex] = { ...newItems[activeIndex], category: overId };
        }
      } else if (activeId !== overId) {
        const overIndex = newItems.findIndex(q => q.id === overId);
        if (overIndex > -1) {
          if (newItems[activeIndex].category !== newItems[overIndex].category) {
            newItems[activeIndex] = { ...newItems[activeIndex], category: newItems[overIndex].category };
          }
          newItems = arrayMove(newItems, activeIndex, overIndex);
        }
      }
      
      saveToBackend(newItems);
      return newItems;
    });
  }, [saveToBackend]);

  const handleUpdate = useCallback((qId: string, updates: Partial<ManagedQuestion>) => {
    setItems(prev => {
      const newItems = prev.map(q => q.id === qId ? { ...q, ...updates, metadata: { ...q.metadata, is_edited: true } } : q);
      saveToBackend(newItems);
      return newItems;
    });
  }, [saveToBackend]);

  const handleDelete = useCallback((qId: string) => {
    setItems(prev => {
      const newItems = prev.filter(q => q.id !== qId);
      saveToBackend(newItems);
      return newItems;
    });
  }, [saveToBackend]);

  const handleTogglePin = useCallback((qId: string) => {
    setItems(prev => {
      const newItems = prev.map(q => q.id === qId ? { ...q, metadata: { ...q.metadata, is_pinned: !q.metadata?.is_pinned } } : q);
      saveToBackend(newItems);
      return newItems;
    });
  }, [saveToBackend]);

  const confirmAdd = useCallback((newQuestion: Omit<ManagedQuestion, 'id'>) => {
    const newQ: ManagedQuestion = {
      ...newQuestion,
      id: `q_manual_${Date.now()}`
    };
    
    setItems(prev => {
      const newItems = [...prev, newQ];
      saveToBackend(newItems);
      return newItems;
    });
    setAddModalCategory(null);
  }, [saveToBackend]);

  const handleRegenerateCategory = async (category: string) => {
    if (!id) return;
    try {
      setOptimisticGenerating('category', category);
      await KitsAPI.regenerateSection(id, 'category', { category });
      await mutateStatus(); // Fetch real status
    } catch (e) {
      console.error('Failed to regenerate category', e);
      await mutateStatus(); // Revert on error
    }
  };

  if (!kitData || !kitData.questions) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? "Saving changes..." : "All changes saved"}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        {CATEGORIES.map(category => {
          const categoryItems = items.filter(q => q.category === category);
          
          return (
            <CategoryColumn 
              key={category}
              categoryId={category}
              items={categoryItems}
              onAdd={setAddModalCategory}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
              onRegenerate={handleRegenerateCategory}
              isRegenerating={regenerationStates?.questions?.category?.[category] === 'generating'}
            />
          );
        })}
      </DndContext>

      <AddQuestionModal 
        isOpen={!!addModalCategory}
        category={addModalCategory}
        onClose={() => setAddModalCategory(null)}
        onConfirm={confirmAdd}
      />
    </div>
  );
};

export default QuestionsTab;
