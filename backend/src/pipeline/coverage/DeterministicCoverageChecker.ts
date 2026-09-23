import { Question, Requirement } from '../../types/schemas';

export interface CoverageResult {
  isFullyCovered: boolean;
  uncoveredMustHaves: string[];
  uncoveredNiceHaves: string[];
}

/**
 * Deterministically checks coverage of requirements by generated questions.
 * This ensures the logic is transparent, purely arithmetic, and not dependent on LLMs.
 */
export class DeterministicCoverageChecker {
  public check(requirements: Requirement[], questions: Question[]): CoverageResult {
    const coveredRequirementIds = new Set<string>();

    // Collect all requirement IDs that have been covered by at least one question
    questions.forEach((q) => {
      q.requirement_ids.forEach((reqId) => coveredRequirementIds.add(reqId));
    });

    const uncoveredMustHaves: string[] = [];
    const uncoveredNiceHaves: string[] = [];

    requirements.forEach((req) => {
      if (!coveredRequirementIds.has(req.id)) {
        if (req.priority === 'must') {
          uncoveredMustHaves.push(req.id);
        } else {
          uncoveredNiceHaves.push(req.id);
        }
      }
    });

    return {
      // The kit fails coverage checks ONLY if 'must-have' requirements are uncovered.
      isFullyCovered: uncoveredMustHaves.length === 0,
      uncoveredMustHaves,
      uncoveredNiceHaves,
    };
  }
}
