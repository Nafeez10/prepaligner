import { Circle } from 'lucide-react';
import { ScheduleDay, ManagedQuestion } from '@/types/kit';

interface ScheduleDayCardProps {
  day: ScheduleDay;
  questions?: ManagedQuestion[];
}

export const ScheduleDayCard = ({ day, questions }: ScheduleDayCardProps) => {
  return (
    <div className="relative pl-6 md:pl-8 group">
      <div className="absolute -left-[13px] md:-left-[17px] top-1 h-6 w-6 md:h-8 md:w-8 rounded-full bg-card border-2 border-border/20 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-accent transition-all duration-300">
        <Circle className="h-2 w-2 md:h-3 md:w-3 text-brand-navy" fill="currentColor" />
      </div>
      
      <div className="bg-card border border-border/15 shadow-sm rounded-xl p-4 md:p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-2 md:mb-3">
          <span className="text-xs md:text-sm font-bold text-primary uppercase tracking-wide">
            Day {day.day} ({day.minutes} min)
          </span>
          <h3 className="text-base md:text-lg font-semibold">{day.focus}</h3>
        </div>
        
        <ul className="list-disc pl-4 space-y-1.5 text-muted-foreground">
          {day.question_ids.length > 0 ? (
            day.question_ids.map((qId: string, idx: number) => {
              const question = questions?.find((q) => q.id === qId);
              if (!question) return null;
              return (
                <li key={idx} className="leading-relaxed text-xs md:text-sm">
                  Review Question: "{question.prompt}"
                </li>
              );
            })
          ) : (
            <li className="leading-relaxed text-xs md:text-sm">
              Review foundational material and rest.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
