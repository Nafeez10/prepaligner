import { describe, it, expect } from 'vitest';
import { DeterministicScheduler } from '../src/pipeline/scheduler/DeterministicScheduler';
import { Question, Requirement } from '../src/types/schemas';

describe('DeterministicScheduler', () => {
  const scheduler = new DeterministicScheduler();

  const requirements: Requirement[] = [
    { id: 'r1', text: 'React', kind: 'technical', priority: 'must' },
    { id: 'r2', text: 'Node', kind: 'technical', priority: 'nice' }
  ];

  const questions: Question[] = [
    { id: 'q1', requirement_ids: ['r1'], category: 'technical', prompt: 'Q1', answer_outline: 'A1', difficulty: 3 },
    { id: 'q2', requirement_ids: ['r2'], category: 'technical', prompt: 'Q2', answer_outline: 'A2', difficulty: 1 },
    { id: 'q3', requirement_ids: ['r1'], category: 'system-design', prompt: 'Q3', answer_outline: 'A3', difficulty: 3 }
  ];

  it('should allocate exactly the requested number of days', () => {
    const result = scheduler.allocate(5, requirements, questions);
    expect(result.days_available).toBe(5);
    expect(result.days.length).toBe(5);
    
    // Ensure day indices are 1-5
    expect(result.days.map(d => d.day)).toEqual([1, 2, 3, 4, 5]);
  });

  it('should prioritize harder and must-have questions earlier', () => {
    // q3 is must-have and system-design and diff 3 (highest score)
    // q1 is must-have and technical and diff 3 (second highest score)
    // q2 is nice-to-have and diff 1 (lowest score)
    const result = scheduler.allocate(3, requirements, questions);
    
    // Day 1 should have the highest priority item
    expect(result.days[0].question_ids).toContain('q3');
    // It round robins, so q1 goes to day 2
    expect(result.days[1].question_ids).toContain('q1');
    // q2 goes to day 3
    expect(result.days[2].question_ids).toContain('q2');
  });

  it('should calculate integer minutes based on difficulty', () => {
    const result = scheduler.allocate(1, requirements, questions);
    expect(result.days.length).toBe(1);
    
    // q1 (diff 3) -> 45m
    // q2 (diff 1) -> 15m
    // q3 (diff 3) -> 45m
    // Total = 105m
    expect(result.days[0].minutes).toBe(105);
  });
});
