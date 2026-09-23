import { JobDescriptionExtractor } from '../generator/JobDescriptionExtractor';
import { CompanyCrawlerService } from '../crawler/CompanyCrawlerService';
import { ExternalResearchOrchestrator } from '../research/ExternalResearchOrchestrator';
import { QuestionGenerator } from '../generator/QuestionGenerator';
import { DeterministicCoverageChecker } from '../coverage/DeterministicCoverageChecker';
import { SecondPassEngine } from '../generator/SecondPassEngine';
import { DeterministicScheduler } from '../scheduler/DeterministicScheduler';
import { FlashcardGenerator } from '../generator/FlashcardGenerator';
import { LLMProviderFactory } from '../llm/LLMProviderFactory';
import { Kit, KitSchema } from '../../types/schemas';

export class KitGenerationOrchestrator {
  public async generateKit(jd: string, companyUrl: string, days: number, providerName: string = 'gemini', roleName: string = ''): Promise<{ kit: Kit, rawContext: string }> {
    const llm = LLMProviderFactory.createProvider(providerName);
    
    // Services
    const extractor = new JobDescriptionExtractor(llm);
    const crawler = new CompanyCrawlerService();
    const externalResearcher = new ExternalResearchOrchestrator();
    const questionGen = new QuestionGenerator(llm);
    const coverageChecker = new DeterministicCoverageChecker();
    const secondPass = new SecondPassEngine(llm);
    const scheduler = new DeterministicScheduler();
    const flashcardGen = new FlashcardGenerator(llm);

    // Step 1: Research
    let crawlerResult = { summaryContent: '', pagesCrawled: [] as string[] };
    let companyName = "the company";
    try {
      crawlerResult = await crawler.crawl(companyUrl);
      // Try to guess company name from URL for research
      const urlObj = new URL(companyUrl);
      companyName = urlObj.hostname.replace('www.', '').split('.')[0];
    } catch (e) {
      crawlerResult.summaryContent = 'No company website found or reachable.';
    }

    // Step 1b: External Research (uses role name from user input)
    const researchResult = await externalResearcher.research(companyName, roleName);

    // Combine context from company site + external sources
    const companyContext = `Company Website Info:\n${crawlerResult.summaryContent}\n\nExternal Research (${researchResult.sources.join(', ') || 'none'}):\n${researchResult.contextString}`;

    // Step 2: Extraction
    const role = await extractor.extract(jd);

    // Step 3: Pass 1 - Question Generation
    const questions = await questionGen.generateQuestions(role.requirements, companyContext);

    // Step 4: Coverage Checking & Pass 2
    let coverage = coverageChecker.check(role.requirements, questions);
    let passes = 1;
    const MAX_PASSES = 3;

    while (!coverage.isFullyCovered && passes < MAX_PASSES) {
      const uncoveredReqs = role.requirements.filter(r => coverage.uncoveredMustHaves.includes(r.id));
      if (uncoveredReqs.length > 0) {
        const gapQuestions = await secondPass.generateGapQuestions(uncoveredReqs, companyContext);
        questions.push(...gapQuestions);
      }
      passes++;
      coverage = coverageChecker.check(role.requirements, questions);
    }

    // Step 5: Flashcards
    const flashcards = await flashcardGen.generateFlashcards(questions);

    // Step 6: Schedule Allocation
    const schedule = scheduler.allocate(days, role.requirements, questions);

    // Step 7: Company Brief
    const companyBrief = await llm.generateJSON<any>(`
      Generate a brief summary of the company based on this context:
      ${companyContext}
      
      Respond in JSON: { "summary": "...", "what_they_do": "..." }
    `, {});

    const kit = {
      source: {
        company: companyName,
        company_url: companyUrl,
        role: role.title,
        location: "Remote/Unspecified", // Extractor could enhance this
        jd_chars: jd.length,
        researched_at: new Date().toISOString(),
        pages_used: crawlerResult.pagesCrawled
      },
      company_brief: {
        summary: companyBrief?.summary || 'N/A',
        what_they_do: companyBrief?.what_they_do || 'N/A',
        sources: crawlerResult.pagesCrawled
      },
      role,
      questions,
      flashcards,
      schedule,
      coverage: {
        uncovered_requirement_ids: coverage.uncoveredMustHaves,
        passes
      }
    };

    // Step 8: Validate against Appendix A Schema
    const parseResult = KitSchema.safeParse(kit);
    if (!parseResult.success) {
      console.error("Schema validation failed", parseResult.error);
      throw new Error("Generated kit does not conform to Appendix A schema.");
    }

    return { kit: parseResult.data as Kit, rawContext: companyContext };
  }
}
