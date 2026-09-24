import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKit, KitsAPI } from '@/api/routes/KitsAPI';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';

import { ManagedFlashcard } from '@/types/kit';

const PracticeMode = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { kit, mutate, isLoading, error } = useKit(id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [sessionCards, setSessionCards] = useState<ManagedFlashcard[]>([]);
  const [sessionStarted, setSessionStarted] = useState(false);

  // Initialize and sort flashcards ONLY at the start of a session
  useEffect(() => {
    if (kit?.kitData?.flashcards && !sessionStarted) {
      const cards = [...kit.kitData.flashcards];

      // Sort logic: 
      // 1. Cards with no confidence score go first
      // 2. Lowest confidence scores go first
      // 3. Oldest reviewed cards go first
      cards.sort((a, b) => {
        const confA = a.metadata?.confidence || 0;
        const confB = b.metadata?.confidence || 0;

        if (confA !== confB) {
          return confA - confB; // Lower confidence first
        }

        const timeA = a.metadata?.last_reviewed ? new Date(a.metadata.last_reviewed).getTime() : 0;
        const timeB = b.metadata?.last_reviewed ? new Date(b.metadata.last_reviewed).getTime() : 0;

        return timeA - timeB; // Older dates first
      });

      setSessionCards(cards);
      setSessionStarted(true);
    }
  }, [kit?.kitData?.flashcards, sessionStarted]);

  // Reset flip state when moving to a new card
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Preparing practice session...</p>
      </div>
    );
  }

  if (error || !kit || sessionCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Unable to start practice</h2>
        <p className="text-muted-foreground">Kit not found or has no flashcards.</p>
        <Button variant="outline" onClick={() => navigate(`/kits/${id}`)}>Go Back</Button>
      </div>
    );
  }

  const isComplete = currentIndex >= sessionCards.length;

  const handleRate = async (confidenceScore: number) => {
    if (!kit.kitData || !id) return;

    setIsSaving(true);
    const currentCard = sessionCards[currentIndex];

    // Update local state
    const updatedCards = kit.kitData.flashcards.map((fc: ManagedFlashcard) => {
      if (fc.id === currentCard.id) {
        return {
          ...fc,
          metadata: {
            ...fc.metadata,
            confidence: confidenceScore,
            last_reviewed: new Date().toISOString()
          }
        };
      }
      return fc;
    });

    const updatedKitData = { ...kit.kitData, flashcards: updatedCards };

    try {
      // Optimistic UI update
      mutate({ ...kit, kitData: updatedKitData }, false);

      // We don't await this so the user can move to the next card instantly
      KitsAPI.updateKitData(id, updatedKitData);

      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } catch (e) {
      console.error("Failed to save rating", e);
    } finally {
      setIsSaving(false);
    }
  };

  const onRateClick = (e: React.MouseEvent, score: number) => {
    e.stopPropagation();
    handleRate(score);
  };

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 max-md:px-0 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <div className="h-24 w-24 max-md:h-16 max-md:w-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 max-md:h-10 max-md:w-10 text-green-500" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl max-md:text-xl font-bold text-primary tracking-tight">Session Complete!</h2>
          <p className="text-muted-foreground mt-2 text-lg max-md:text-sm">You've reviewed all flashcards in this kit.</p>
        </div>
        <div className="flex justify-center gap-4 max-md:gap-3">
          <Button variant="outline" onClick={() => navigate(`/kits/${id}`)} className="max-md:h-fit px-6">
            Return to Kit
          </Button>
          <Button onClick={() => { setCurrentIndex(0); setSessionStarted(false); }} className="max-md:h-fit px-6 gap-2">
            <RotateCcw className="h-4 w-4" /> Practice Again
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = sessionCards[currentIndex];
  const progress = ((currentIndex) / sessionCards.length) * 100;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-0 sm:px-4 space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="!pl-0 gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate(`/kits/${id}`)}>
          <ChevronLeft className="h-4 w-4" /> Exit Practice
        </Button>
        <div className="text-sm font-medium text-muted-foreground">
          Card {currentIndex + 1} of {sessionCards.length}
        </div>
      </div>

      <div className="w-full bg-secondary border border-border/10 h-2 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="w-full min-h-[400px]">
        <Card
          className="bg-card border border-border/15 min-h-[400px] w-full flex flex-col shadow-sm rounded-xl overflow-hidden cursor-pointer hover:border-border/30 transition-colors relative"
          onClick={() => !isFlipped && setIsFlipped(true)}
        >
          {/* Front of Card */}
          <div className={`absolute inset-0 flex flex-col justify-center items-center p-2 sm:p-8 md:p-12 text-center transition-all duration-300 ${isFlipped ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'}`}>
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-secondary border border-border/10 px-3 py-1 rounded-full">
              Question
            </div>
            <h2 className="text-2xl md:text-3xl max-sm:px-2 font-medium leading-relaxed max-w-2xl text-foreground">
              {currentCard.front}
            </h2>
            <div className="absolute bottom-4 sm:bottom-8 text-sm text-muted-foreground animate-pulse">
              Click anywhere to reveal answer
            </div>
          </div>

          {/* Back of Card */}
          <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${!isFlipped ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'}`}>
            <div className="flex-1 p-2 sm:p-8 md:p-12 flex flex-col justify-center items-center text-center overflow-y-auto">
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-xs font-semibold uppercase tracking-wider text-green-600 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                Answer
              </div>
              <p className="text-lg md:text-xl max-sm:px-2 font-medium leading-relaxed max-w-2xl text-foreground whitespace-pre-wrap mt-8">
                {currentCard.back}
              </p>
            </div>

            {/* Rating Actions */}
            <div className="p-2 sm:p-6 border-t border-border/15 bg-secondary/30 flex-shrink-0">
              <p className="text-center text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4">How well did you know this?</p>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto">
                <Button
                  variant="outline"
                  className="h-14 border-red-500/20 hover:bg-red-500/10 hover:text-red-600 text-red-500 flex flex-col gap-1"
                  onClick={(e) => onRateClick(e, 1)}
                  disabled={isSaving}
                >
                  <span className="font-bold">Hard</span>
                  <span className="text-[10px] opacity-70">Review soon</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-14 border-yellow-500/20 hover:bg-yellow-500/10 hover:text-yellow-600 text-yellow-600 flex flex-col gap-1"
                  onClick={(e) => onRateClick(e, 2)}
                  disabled={isSaving}
                >
                  <span className="font-bold">Good</span>
                  <span className="text-[10px] opacity-70">Review later</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-14 border-green-500/20 hover:bg-green-500/10 hover:text-green-600 text-green-500 flex flex-col gap-1"
                  onClick={(e) => onRateClick(e, 3)}
                  disabled={isSaving}
                >
                  <span className="font-bold">Easy</span>
                  <span className="text-[10px] opacity-70">Review much later</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PracticeMode;
