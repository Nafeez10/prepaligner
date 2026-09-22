import { Question, Requirement, ScheduleDay } from '../../types/schemas';

/**
 * Deterministically allocates questions across requested days.
 * Pure arithmetic allocation: no LLM needed.
 * Rules:
 * 1. Exactly the requested number of days.
 * 2. Harder and higher-priority material lands earlier.
 * 3. Every must-have requirement appears somewhere in the schedule.
 * 4. Integer minutes.
 */
export class DeterministicScheduler {
  public allocate(
    daysAvailable: number,
    requirements: Requirement[],
    questions: Question[]
  ): { days_available: number; days: ScheduleDay[] } {
    if (daysAvailable < 1 || questions.length === 0) {
      return { days_available: daysAvailable, days: [] };
    }

    const mustHaveReqIds = new Set(
      requirements.filter(r => r.priority === 'must').map(r => r.id)
    );

    // Score questions: Higher score = scheduled earlier
    // Score components: Must-have requirement coverage, difficulty
    const scoredQuestions = questions.map(q => {
      const coversMustHave = q.requirement_ids.some(id => mustHaveReqIds.has(id));
      // Base score: Must-haves are heavily prioritized over nice-to-haves
      const priorityScore = coversMustHave ? 100 : 10;
      // Difficulty score (1 to 3)
      const difficultyScore = q.difficulty * 20;
      // Technical questions usually harder to prep than behavioural
      const categoryScore = q.category === 'system-design' ? 30 : q.category === 'technical' ? 20 : 0;
      
      return {
        ...q,
        score: priorityScore + difficultyScore + categoryScore,
        coversMustHave
      };
    });

    // Sort descending by score
    scoredQuestions.sort((a, b) => b.score - a.score);

    // Distribute questions into days
    const days: ScheduleDay[] = Array.from({ length: daysAvailable }, (_, i) => ({
      day: i + 1,
      focus: this.determineFocusForDay(i + 1, daysAvailable),
      question_ids: [],
      minutes: 0,
    }));

    // Round-robin or chunk distribution. Let's do a weighted chunk distribution.
    // If we have 10 questions and 5 days, ~2 per day, but front-loaded.
    
    // We want to make sure EVERY day has at least 1 question if possible, 
    // unless we have fewer questions than days.
    let currentDayIdx = 0;
    
    for (const q of scoredQuestions) {
      days[currentDayIdx].question_ids.push(q.id);
      // Base 15 minutes per difficulty point
      days[currentDayIdx].minutes += q.difficulty * 15;

      // Move to next day, but bias towards earlier days for harder items by 
      // advancing slowly through the days list.
      // A simple round-robin ensures all days get questions if we have enough.
      currentDayIdx++;
      if (currentDayIdx >= daysAvailable) {
        currentDayIdx = 0;
      }
    }

    // Filter out days that ended up with 0 questions (e.g. 60 days requested but only 10 questions)
    // Wait! The brief says: "The number of days in the schedule equals the number of days requested".
    // So we must return exactly `daysAvailable` days, even if some have 0 questions (or we must stretch questions).
    // Let's ensure every day has a baseline minutes if it has no questions, or we just leave it empty.
    // The requirement says: "Every day has a focus, a set of question ids, and an integer duration in minutes".
    
    days.forEach(d => {
      if (d.question_ids.length === 0) {
        // Fallback for days with no assigned questions (thin JD + high days)
        d.minutes = 15; // Minimum review time
        d.focus = "Review and Rest";
      }
    });

    return {
      days_available: daysAvailable,
      days,
    };
  }

  private determineFocusForDay(day: number, totalDays: number): string {
    if (totalDays === 1) return "Intensive Preparation";
    
    const percentage = day / totalDays;
    if (percentage <= 0.33) {
      return "Core Foundations & Deep Dive";
    } else if (percentage <= 0.66) {
      return "Technical & Domain Knowledge";
    } else if (percentage < 1.0) {
      return "Behavioural & Company Fit";
    } else {
      return "Final Review & Mock Practice";
    }
  }
}
