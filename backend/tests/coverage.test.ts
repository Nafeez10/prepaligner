import { describe, it, expect } from 'vitest';
import { DeterministicCoverageChecker } from '../src/pipeline/coverage/DeterministicCoverageChecker';
import { Question, Requirement } from '../src/types/schemas';

describe('DeterministicCoverageChecker', () => {
  const checker = new DeterministicCoverageChecker();

  it('should return fully covered when all must-haves are covered', () => {
    const requirements: Requirement[] = [
      { id: 'r1', text: 'React', kind: 'technical', priority: 'must' },
      { id: 'r2', text: 'GraphQL', kind: 'technical', priority: 'nice' }
    ];
    
    const questions: Question[] = [
      { id: 'q1', requirement_ids: ['r1'], category: 'technical', prompt: 'Q', answer_outline: 'A', difficulty: 2 }
    ];

    const result = checker.check(requirements, questions);
    expect(result.isFullyCovered).toBe(true);
    expect(result.uncoveredMustHaves).toEqual([]);
    expect(result.uncoveredNiceHaves).toEqual(['r2']);
  });

  it('should return not fully covered when a must-have is missing', () => {
    const requirements: Requirement[] = [
      { id: 'r1', text: 'React', kind: 'technical', priority: 'must' },
      { id: 'r3', text: 'Node', kind: 'technical', priority: 'must' }
    ];
    
    const questions: Question[] = [
      { id: 'q1', requirement_ids: ['r1'], category: 'technical', prompt: 'Q', answer_outline: 'A', difficulty: 2 }
    ];

    const result = checker.check(requirements, questions);
    expect(result.isFullyCovered).toBe(false);
    expect(result.uncoveredMustHaves).toEqual(['r3']);
  });
});
