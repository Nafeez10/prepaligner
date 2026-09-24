import { useState, memo, MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Pin, PinOff, GripVertical, Trash2, Edit2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ManagedFlashcard } from '@/types/kit';
import { FlashcardEditModal } from './FlashcardEditModal';

interface SortableFlashcardProps {
  flashcard: ManagedFlashcard;
  onTogglePin: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<ManagedFlashcard>) => void;
}

const SortableFlashcard = ({ flashcard, onTogglePin, onDelete, onUpdate }: SortableFlashcardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: flashcard.id });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { front: question, back: answer } = flashcard;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const isPinned = !!flashcard.metadata?.is_pinned;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="relative h-64 w-full perspective-1000 group"
      >
        <div
          className="absolute w-full h-full transition-all duration-500 preserve-3d cursor-pointer"
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          onClick={() => !isEditing && setIsFlipped(!isFlipped)}
        >
          {/* Front (Question) */}
          <div
            className={`absolute w-full h-full backface-hidden bg-card border border-border/15 shadow-md rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${isPinned ? 'ring-2 ring-accent' : ''}`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Controls Overlay */}
            <div className="absolute top-2 left-2 z-10 flex max-md:flex-row flex-col gap-1 max-md:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity max-md:bg-background/80 max-md:p-1 max-md:rounded-br-xl" onClick={e => e.stopPropagation()}>
              <div {...attributes} {...listeners} className="p-2 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing">
                <GripVertical className="h-4 w-4" />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="absolute top-2 right-2 max-md:top-3 max-md:right-3 z-10" onClick={e => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full h-8 w-8 ${isPinned ? 'text-primary bg-primary/10 max-md:opacity-100 opacity-100' : 'text-muted-foreground hover:text-foreground max-md:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity max-md:bg-background/50'}`}
                onClick={onTogglePin}
                title={isPinned ? "Unpin flashcard" : "Pin flashcard"}
              >
                {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
              </Button>
            </div>
            <span className="absolute bottom-4 right-4 text-xs font-semibold text-muted-foreground uppercase">Q</span>
            <h3 className="text-base md:text-lg font-medium">{question}</h3>
            <p className="absolute bottom-4 left-4 text-xs text-muted-foreground animate-pulse">Click to flip</p>
          </div>

          {/* Back (Answer) */}
          <div
            className="absolute w-full h-full backface-hidden bg-secondary border border-border/15 shadow-md rounded-xl p-6 flex flex-col items-center justify-center text-center text-brand-navy"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className="absolute bottom-4 right-4 text-xs font-semibold text-muted-foreground uppercase">A</span>
            <p className="text-xs md:text-sm leading-relaxed">{answer}</p>
          </div>
        </div>
      </div>

      <FlashcardEditModal
        flashcard={flashcard}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={onUpdate}
      />
    </>
  );
};

export default memo(SortableFlashcard);
