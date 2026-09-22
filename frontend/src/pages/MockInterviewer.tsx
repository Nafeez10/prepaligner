import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKit } from '@/api/routes/KitsAPI';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2, PlaySquare, Eye, CheckCircle2 } from 'lucide-react';

const MockInterviewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { kit, isLoading, error } = useKit(id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOutline, setShowOutline] = useState(false);

  const questions = kit?.kitData?.questions || [];

  // Reset outline state when changing questions
  useEffect(() => {
    setShowOutline(false);
  }, [currentIndex]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Preparing interview...</p>
      </div>
    );
  }

  if (error || !kit || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Unable to start interview</h2>
        <p className="text-muted-foreground">Kit not found or has no questions.</p>
        <Button variant="outline" onClick={() => navigate(`/kits/${id}`)}>Go Back</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={() => navigate(`/kits/${id}`)}>
          <ChevronLeft className="h-4 w-4" /> Exit Interview
        </Button>
        <div className="text-sm font-medium">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <Card className="glass-card min-h-[400px] flex flex-col border-t-4 border-t-primary shadow-2xl">
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center items-center text-center space-y-8 relative">
          <div className="absolute top-6 left-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
            {currentQuestion.category}
          </div>
          
          <PlaySquare className="h-12 w-12 text-primary/40" />
          
          <h2 className="text-2xl md:text-3xl font-medium leading-relaxed max-w-3xl">
            {currentQuestion.prompt}
          </h2>

          {showOutline && (
            <div className="mt-8 text-left w-full max-w-2xl bg-black/40 p-6 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-4">
              <h4 className="text-sm font-semibold text-primary mb-3">Ideal Answer Outline</h4>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {currentQuestion.answer_outline}
              </div>
            </div>
          )}
        </div>
        
        <CardContent className="p-6 border-t border-white/5 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto gap-2"
            onClick={() => setShowOutline(!showOutline)}
          >
            <Eye className="h-4 w-4" />
            {showOutline ? 'Hide Outline' : 'Show Outline'}
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button 
              variant="secondary" 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            
            {!isLast ? (
              <Button 
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="gap-2 min-w-[120px]"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={() => navigate(`/kits/${id}`)}
                className="gap-2 min-w-[120px] bg-green-600 hover:bg-green-700 text-white"
              >
                Finish <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockInterviewer;
