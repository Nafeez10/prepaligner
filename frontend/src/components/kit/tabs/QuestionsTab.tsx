import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { KitsAPI, useKit } from '@/api/routes/KitsAPI';
import { useDebouncedMutation } from '@/hooks/useDebouncedMutation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
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

  const { mutate: saveQuestionsOrder, isSaving: isSavingOrder } = useDebouncedMutation({
    mutationFn: (newItems: ManagedQuestion[]) => KitsAPI.updateQuestionsArray(id!, newItems),
    onMutate: (newItems) => mutate((prev: any) => prev ? { ...prev, kitData: { ...prev.kitData, questions: newItems } } : prev, { revalidate: false }),
    onError: () => mutate()
  });

  const { mutate: saveQuestion, isSaving: isSavingItem } = useDebouncedMutation({
    mutationFn: ({ qId, q }: { qId: string, q: ManagedQuestion }) => KitsAPI.updateQuestion(id!, qId, q),
    onMutate: ({ qId, q }) => {
      mutate((prev: any) => {
        if (!prev) return prev;
        const items = prev.kitData.questions.map((item: any) => item.id === qId ? q : item);
        return { ...prev, kitData: { ...prev.kitData, questions: items } };
      }, { revalidate: false });
    },
    onError: () => mutate()
  });

  const { mutate: deleteQuestion } = useDebouncedMutation({
    mutationFn: (qId: string) => KitsAPI.deleteQuestion(id!, qId),
    onMutate: (qId) => {
      mutate((prev: any) => {
        if (!prev) return prev;
        const items = prev.kitData.questions.filter((item: any) => item.id !== qId);
        return { ...prev, kitData: { ...prev.kitData, questions: items } };
      }, { revalidate: false });
    },
    onError: () => mutate()
  });

  const { mutate: createQuestion } = useDebouncedMutation({
    mutationFn: (q: ManagedQuestion) => KitsAPI.createQuestion(id!, q),
    onMutate: (q) => {
      mutate((prev: any) => {
        if (!prev) return prev;
        const items = [...prev.kitData.questions, q];
        return { ...prev, kitData: { ...prev.kitData, questions: items } };
      }, { revalidate: false });
    },
    onError: () => mutate()
  });

  const isSaving = isSavingOrder || isSavingItem;
  
  const [items, setItems] = useState<ManagedQuestion[]>([]);
  const [addModalCategory, setAddModalCategory] = useState<string | null>(null);

  useEffect(() => {
    setItems(kitData?.questions || []);
  }, [kitData?.questions]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
          newItems[activeIndex] = { ...newItems[activeIndex], category: overId as any };
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
          newItems[activeIndex] = { ...newItems[activeIndex], category: overId as any };
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
      
      saveQuestionsOrder(newItems);
      return newItems;
    });
  }, [saveQuestionsOrder]);

  const handleUpdate = useCallback((qId: string, updates: Partial<ManagedQuestion>) => {
    setItems(prev => {
      const newItems = prev.map(q => {
        if (q.id === qId) {
          const updatedQ = { ...q, ...updates, metadata: { ...q.metadata, is_edited: true } };
          saveQuestion({ qId, q: updatedQ });
          return updatedQ;
        }
        return q;
      });
      return newItems;
    });
  }, [saveQuestion]);

  const handleDelete = useCallback((qId: string) => {
    setItems(prev => prev.filter(q => q.id !== qId));
    deleteQuestion(qId);
  }, [deleteQuestion]);

  const handleTogglePin = useCallback((qId: string) => {
    setItems(prev => {
      const newItems = prev.map(q => {
        if (q.id === qId) {
          const updatedQ = { ...q, metadata: { ...q.metadata, is_pinned: !q.metadata?.is_pinned } };
          saveQuestion({ qId, q: updatedQ });
          return updatedQ;
        }
        return q;
      });
      return newItems;
    });
  }, [saveQuestion]);

  const confirmAdd = useCallback((newQuestion: Omit<ManagedQuestion, 'id'>) => {
    const newQ: ManagedQuestion = {
      ...newQuestion,
      id: `q_manual_${Date.now()}`
    };
    
    setItems(prev => [...prev, newQ]);
    createQuestion(newQ);
    setAddModalCategory(null);
  }, [createQuestion]);

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
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 items-start">
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
