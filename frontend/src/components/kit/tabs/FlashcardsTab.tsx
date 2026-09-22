import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { ManagedFlashcard } from '@/types/kit';
import SortableFlashcard from '../builder/SortableFlashcard';
import AddFlashcardModal from '../builder/AddFlashcardModal';

const FlashcardsTab = ({ kitData }: { kitData: any }) => {
  const { id } = useParams<{ id: string }>();
  const { mutate } = useKit(id);
  const { triggerSave, isSaving } = useDebounceSave(id, mutate);

  const [items, setItems] = useState<ManagedFlashcard[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setItems(kitData?.flashcards || []);
  }, [kitData?.flashcards]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const saveToBackend = useCallback((newItems: ManagedFlashcard[]) => {
    if (!kitData) return;
    const updatedKitData = { ...kitData, flashcards: newItems };
    triggerSave(updatedKitData);
  }, [kitData, triggerSave]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems(prev => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(prev, oldIndex, newIndex);
        saveToBackend(newItems);
        return newItems;
      });
    }
  }, [saveToBackend]);

  const togglePin = useCallback((fcId: string) => {
    setItems(prev => {
      const newItems = prev.map(fc => {
        if (fc.id === fcId) {
          return { ...fc, metadata: { ...fc.metadata, is_pinned: !fc.metadata?.is_pinned } };
        }
        return fc;
      });
      saveToBackend(newItems);
      return newItems;
    });
  }, [saveToBackend]);

  const handleDelete = useCallback((fcId: string) => {
    setItems(prev => {
      const newItems = prev.filter(fc => fc.id !== fcId);
      saveToBackend(newItems);
      return newItems;
    });
  }, [saveToBackend]);

  const handleUpdate = useCallback((fcId: string, updates: Partial<ManagedFlashcard>) => {
    setItems(prev => {
      const newItems = prev.map(fc => {
        if (fc.id === fcId) {
          return { ...fc, ...updates, metadata: { ...fc.metadata, is_edited: true } };
        }
        return fc;
      });
      saveToBackend(newItems);
      return newItems;
    });
  }, [saveToBackend]);

  const confirmAdd = useCallback((newFlashcard: Omit<ManagedFlashcard, 'id'>) => {
    const newFc: ManagedFlashcard = {
      ...newFlashcard,
      id: `f_manual_${Date.now()}`
    };
    setItems(prev => {
      const newItems = [...prev, newFc];
      saveToBackend(newItems);
      return newItems;
    });
    setIsAddModalOpen(false);
  }, [saveToBackend]);

  const handleRegenerate = async () => {
    if (!id) return;
    setIsRegenerating(true);
    try {
      await KitsAPI.regenerateSection(id, 'flashcards', items);
      await mutate();
    } catch (e) {
      console.error('Failed to regenerate flashcards', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!kitData || !kitData.flashcards) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? "Saving changes..." : "All changes saved"}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Flashcard
          </Button>
          <Button variant="secondary" onClick={handleRegenerate} disabled={isRegenerating}>
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
