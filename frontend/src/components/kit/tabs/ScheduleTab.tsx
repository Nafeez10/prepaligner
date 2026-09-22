import { CheckCircle2, Circle } from 'lucide-react';

interface Props {
  kitData: any;
}

const ScheduleTab = ({ kitData }: Props) => {
  if (!kitData || !kitData.schedule || !kitData.schedule.days) return null;

  return (
    <div className="space-y-8">
      <div className="relative border-l border-white/10 ml-3 md:ml-4 space-y-8 pb-4">
        {kitData.schedule.days.map((day: any) => (
          <div key={day.day} className="relative pl-8">
            <div className="absolute -left-3.5 top-1 h-7 w-7 rounded-full bg-background border-2 border-primary/50 flex items-center justify-center">
              <Circle className="h-3 w-3 text-primary" fill="currentColor" />
            </div>
            
            <div className="glass-card rounded-xl p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-bold text-primary uppercase tracking-wide">
                  Day {day.day} ({day.minutes} min)
                </span>
                <h3 className="text-lg font-semibold">{day.focus}</h3>
              </div>
              
              <ul className="space-y-2 text-muted-foreground">
                {day.question_ids.length > 0 ? (
                  day.question_ids.map((qId: string, idx: number) => {
                    const question = kitData.questions?.find((q: any) => q.id === qId);
                    if (!question) return null;
                    return (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-white/20 shrink-0" />
                        <span className="leading-relaxed text-sm">Review Question: "{question.prompt}"</span>
                      </li>
                    );
                  })
                ) : (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-white/20 shrink-0" />
                    <span className="leading-relaxed text-sm">Review foundational material and rest.</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleTab;
