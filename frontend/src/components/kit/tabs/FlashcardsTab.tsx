import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, PlaySquare } from 'lucide-react';
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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { ManagedFlashcard, ManagedKit } from '@/types/kit';
import SortableFlashcard from '../builder/SortableFlashcard';
import AddFlashcardModal from '../builder/AddFlashcardModal';

import { RegenerationStates } from '@/api/routes/KitsAPI/types';

const FlashcardsTab = ({ kitData, regenerationStates }: { kitData: ManagedKit, regenerationStates?: RegenerationStates }) => {
  const { id } = useParams<{ id: string }>();
  const { mutate, mutateStatus, setOptimisticGenerating } = useKit(id);

  const { mutate: saveFlashcardsOrder, isSaving: isSavingOrder } = useDebouncedMutation({
    mutationFn: (newItems: ManagedFlashcard[]) => KitsAPI.updateFlashcardsArray(id!, newItems),
    onMutate: (newItems) => mutate((prev: any) => prev ? { ...prev, kitData: { ...prev.kitData, flashcards: newItems } } : prev, { revalidate: false }),
    onError: () => mutate()
  });

  const { mutate: saveFlashcard, isSaving: isSavingItem } = useDebouncedMutation({
    mutationFn: ({ fcId, fc }: { fcId: string, fc: ManagedFlashcard }) => KitsAPI.updateFlashcard(id!, fcId, fc),
    onMutate: ({ fcId, fc }) => {
      mutate((prev: any) => {
        if (!prev) return prev;
        const items = prev.kitData.flashcards.map((item: any) => item.id === fcId ? fc : item);
        return { ...prev, kitData: { ...prev.kitData, flashcards: items } };
      }, { revalidate: false });
    },
    onError: () => mutate()
  });

  const { mutate: deleteFlashcard } = useDebouncedMutation({
    mutationFn: (fcId: string) => KitsAPI.deleteFlashcard(id!, fcId),
    onMutate: (fcId) => {
      mutate((prev: any) => {
        if (!prev) return prev;
        const items = prev.kitData.flashcards.filter((item: any) => item.id !== fcId);
        return { ...prev, kitData: { ...prev.kitData, flashcards: items } };
      }, { revalidate: false });
    },
    onError: () => mutate()
  });

  const { mutate: createFlashcard } = useDebouncedMutation({
    mutationFn: (fc: ManagedFlashcard) => KitsAPI.createFlashcard(id!, fc),
    onMutate: (fc) => {
      mutate((prev: any) => {
        if (!prev) return prev;
        const items = [...prev.kitData.flashcards, fc];
        return { ...prev, kitData: { ...prev.kitData, flashcards: items } };
      }, { revalidate: false });
    },
    onError: () => mutate()
  });

  const isSaving = isSavingOrder || isSavingItem;

  const [items, setItems] = useState<ManagedFlashcard[]>([]);
  const isRegenerating = regenerationStates?.flashcards === 'generating';
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setItems(kitData?.flashcards || []);
  }, [kitData?.flashcards]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems(prev => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(prev, oldIndex, newIndex);
        saveFlashcardsOrder(newItems);
        return newItems;
      });
    }
  }, [saveFlashcardsOrder]);

  const togglePin = useCallback((fcId: string) => {
    setItems(prev => {
      const newItems = prev.map(fc => {
        if (fc.id === fcId) {
          const updatedFc = { ...fc, metadata: { ...fc.metadata, is_pinned: !fc.metadata?.is_pinned } };
          saveFlashcard({ fcId, fc: updatedFc });
          return updatedFc;
        }
        return fc;
      });
      return newItems;
    });
  }, [saveFlashcard]);

  const handleDelete = useCallback((fcId: string) => {
    setItems(prev => prev.filter(fc => fc.id !== fcId));
    deleteFlashcard(fcId);
  }, [deleteFlashcard]);

  const handleUpdate = useCallback((fcId: string, updates: Partial<ManagedFlashcard>) => {
    setItems(prev => {
      const newItems = prev.map(fc => {
        if (fc.id === fcId) {
          const updatedFc = { ...fc, ...updates, metadata: { ...fc.metadata, is_edited: true } };
          saveFlashcard({ fcId, fc: updatedFc });
          return updatedFc;
        }
        return fc;
      });
      return newItems;
    });
  }, [saveFlashcard]);

  const confirmAdd = useCallback((newFlashcard: Omit<ManagedFlashcard, 'id'>) => {
    const newFc: ManagedFlashcard = {
      ...newFlashcard,
      id: `f_manual_${Date.now()}`
    };
    setItems(prev => [...prev, newFc]);
    createFlashcard(newFc);
    setIsAddModalOpen(false);
  }, [createFlashcard]);

  const handleRegenerate = async () => {
    if (!id) return;
    try {
      setOptimisticGenerating('flashcards');
      await KitsAPI.regenerateSection(id, 'flashcards', {});
      await mutateStatus(); // Fetch real status
    } catch (e) {
      console.error('Failed to regenerate flashcards', e);
      await mutateStatus(); // Revert on error
    }
  };

  if (!kitData || !kitData.flashcards) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 items-start">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? "Saving changes..." : "All changes saved"}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link to={`/kits/${id}/practice`} className="w-full sm:w-auto flex">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <PlaySquare className="h-4 w-4" /> Practice
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
          <Button variant="secondary" onClick={handleRegenerate} disabled={isRegenerating} className="w-full sm:w-auto">
            {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Regenerate Unpinned
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((fc) => (
              <SortableFlashcard 
                key={fc.id} 
                flashcard={fc} 
                onTogglePin={() => togglePin(fc.id)}
                onDelete={() => handleDelete(fc.id)}
                onUpdate={(updates) => handleUpdate(fc.id, updates)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <AddFlashcardModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={confirmAdd}
      />
    </div>
  );
};

export default FlashcardsTab;
