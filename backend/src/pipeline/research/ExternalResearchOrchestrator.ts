import {
  IExternalDataSource,
  ExternalDataSourceResult,
  AggregatedResearchResult,
} from './IExternalDataSource';
import { GeeksForGeeksSource } from './sources/GeeksForGeeksSource';
import { DuckDuckGoSource } from './sources/DuckDuckGoSource';
import { GlassdoorSource } from './sources/GlassdoorSource';

export class ExternalResearchOrchestrator {
  private sources: IExternalDataSource[];

  constructor() {
    this.sources = [
      new GeeksForGeeksSource(),
      new DuckDuckGoSource(),
      new GlassdoorSource(),
    ];
  }

  public async research(
    companyName: string,
    roleName: string
  ): Promise<AggregatedResearchResult> {
    // Run all sources concurrently — one failing never blocks others
    const settled = await Promise.allSettled(
      this.sources.map((source) => source.search(companyName, roleName))
    );

    const successfulResults: ExternalDataSourceResult[] = [];
    const failedSources: string[] = [];

    settled.forEach((outcome, index) => {
      if (outcome.status === 'fulfilled') {
        successfulResults.push(outcome.value);
      } else {
        failedSources.push(this.sources[index].sourceName);
        console.warn(
          `[ExternalResearch] Source "${this.sources[index].sourceName}" failed:`,
          outcome.reason
        );
      }
    });

    // Merge and deduplicate
    const allQuestions = this.deduplicateStrings(
      successfulResults.flatMap((r) => r.interviewQuestions)
    );
    const allExperiences = this.deduplicateStrings(
      successfulResults.flatMap((r) => r.interviewExperiences)
    );
    const allInsights = this.deduplicateStrings(
      successfulResults.flatMap((r) => r.companyInsights)
    );

    // Build a context string for LLM consumption
    const contextParts: string[] = [];

    if (allQuestions.length > 0) {
      contextParts.push(
        `Interview Questions Found (${allQuestions.length}):\n` +
          allQuestions.map((q, i) => `  ${i + 1}. ${q}`).join('\n')
      );
    }

    if (allExperiences.length > 0) {
      contextParts.push(
        `Interview Experiences:\n` +
          allExperiences.map((e) => `  - ${e}`).join('\n')
      );
    }

    if (allInsights.length > 0) {
      contextParts.push(
        `Company Insights:\n` + allInsights.map((i) => `  - ${i}`).join('\n')
      );
    }

    if (contextParts.length === 0) {
      contextParts.push(
        'No public discussion of the interview process could be reliably found from external sources.'
      );
    }

    // Log summary for debugging
    const sourcesUsed = successfulResults
      .filter(
        (r) =>
          r.interviewQuestions.length > 0 ||
          r.interviewExperiences.length > 0 ||
          r.companyInsights.length > 0
      )
      .map((r) => r.source);

    console.log(
      `[ExternalResearch] Completed: ${sourcesUsed.length} sources returned data, ${failedSources.length} failed. ` +
        `Questions: ${allQuestions.length}, Experiences: ${allExperiences.length}, Insights: ${allInsights.length}`
    );

    return {
      contextString: contextParts.join('\n\n'),
      sources: sourcesUsed,
      totalQuestions: allQuestions.length,
      totalExperiences: allExperiences.length,
    };
  }

  private deduplicateStrings(items: string[]): string[] {
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const item of items) {
      // Normalize for comparison: lowercase, collapse whitespace
      const normalized = item.toLowerCase().replace(/\s+/g, ' ').trim();

      if (!seen.has(normalized) && normalized.length > 0) {
        seen.add(normalized);
        unique.push(item);
      }
    }

    return unique;
  }
}
