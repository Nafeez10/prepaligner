import { useState, memo, MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Pin, PinOff, GripVertical, Trash2, Edit2, Check } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ManagedFlashcard } from '@/types/kit';

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
  
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const isPinned = !!flashcard.metadata?.is_pinned;

  const handleSave = (e: MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    onUpdate({ front, back });
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="relative h-64 w-full bg-card border border-border/15 shadow-md rounded-xl p-4 flex flex-col gap-3">
        <textarea 
          value={front}
          onChange={e => setFront(e.target.value)}
          className="flex-1 bg-background/50 rounded p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Front text (Question)"
        />
        <textarea 
          value={back}
          onChange={e => setBack(e.target.value)}
          className="flex-1 bg-background/50 rounded p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Back text (Answer)"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground">
            <Check className="h-4 w-4 mr-1"/> Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="relative h-64 w-full perspective-1000 group"
    >
      <div 
        className="absolute w-full h-full transition-all duration-500 preserve-3d cursor-pointer"
        style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <div 
          className={`absolute w-full h-full backface-hidden bg-card border border-border/15 shadow-md rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${isPinned ? 'ring-2 ring-accent' : ''}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Controls Overlay */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
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
          
          <div className="absolute top-4 right-4 z-10" onClick={e => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full h-8 w-8 ${isPinned ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity'}`}
              onClick={onTogglePin}
              title={isPinned ? "Unpin flashcard" : "Pin flashcard"}
            >
              {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
            </Button>
          </div>
          <span className="absolute bottom-4 right-4 text-xs font-semibold text-muted-foreground uppercase">Q</span>
          <h3 className="text-lg font-medium">{flashcard.front}</h3>
          <p className="absolute bottom-4 left-4 text-xs text-muted-foreground animate-pulse">Click to flip</p>
        </div>

        {/* Back */}
        <div 
          className="absolute w-full h-full backface-hidden bg-secondary border border-border/15 shadow-md rounded-xl p-6 flex flex-col items-center justify-center text-center text-brand-navy"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="absolute bottom-4 right-4 text-xs font-semibold text-muted-foreground uppercase">A</span>
          <p className="text-sm leading-relaxed">{flashcard.back}</p>
        </div>
      </div>
    </div>
  );
};

export default memo(SortableFlashcard);
