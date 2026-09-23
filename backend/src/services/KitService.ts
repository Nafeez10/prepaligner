import { KitModel, IKitDoc } from '../models/Kit';
import { KitGenerationOrchestrator } from '../pipeline/orchestrator/KitGenerationOrchestrator';
import { Kit, ManagedKit, ManagedQuestion, ManagedFlashcard } from '../types/schemas';
import { LLMProviderFactory } from '../pipeline/llm/LLMProviderFactory';
import { DeterministicScheduler } from '../pipeline/scheduler/DeterministicScheduler';
import { QuestionGenerator } from '../pipeline/generator/QuestionGenerator';
import { FlashcardGenerator } from '../pipeline/generator/FlashcardGenerator';

const orchestrator = new KitGenerationOrchestrator();

type GenerationParams = {
  kitId: string;
  jd: string;
  companyUrl: string;
  days: number;
  provider: string;
  roleName: string;
};

export class KitService {
  /**
   * Kicks off background kit generation and updates the DB document when done.
   * Fire-and-forget: call this after responding 202 to the client.
   */
  static runGeneration(params: GenerationParams): void {
    // Intentionally not awaited — runs in the background
    KitService.executeGeneration(params).catch((err) => {
      console.error('[KitService] Unhandled generation error:', err);
    });
  }

  private static async executeGeneration(params: GenerationParams): Promise<void> {
    const { kitId, jd, companyUrl, days, provider, roleName } = params;
    try {
      const { kit: generatedKit, rawContext } = await orchestrator.generateKit(
        jd,
        companyUrl,
        days,
        provider,
        roleName
      );

      const managedKit = KitService.decorateWithMetadata(generatedKit);

      await KitModel.findByIdAndUpdate(kitId, {
        status: 'completed',
        kitData: managedKit,
        raw_context: rawContext,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      console.error('[KitService] Kit generation failed:', message);
      await KitModel.findByIdAndUpdate(kitId, {
        status: 'failed',
        error: message,
      });
    }
  }

  /**
   * Kicks off background section regeneration. Updates regeneration_states in DB throughout.
   * Fire-and-forget: call this after responding 202 to the client.
   */
  public static runSectionGeneration(kit: IKitDoc, section: string, payload: any): void {
    KitService.executeSectionGeneration(kit, section, payload).catch((err) => {
      console.error('[KitService] Unhandled section generation error:', err);
    });
  }

  private static async executeSectionGeneration(kit: IKitDoc, section: string, payload: any): Promise<void> {
    const kitId = String(kit._id);

    // Build the DB path key for this specific target
    const stateKey = section === 'category'
      ? `regeneration_states.questions.category.${payload?.category}`
      : `regeneration_states.${section}`;

    // 1. Mark as generating (this is now done synchronously in KitController before responding)
    
    try {
      const updatedData = await KitService.regenerateSection(kit, section, payload);

      // 2. Save new data and mark as idle
      await KitModel.findByIdAndUpdate(kitId, {
        $set: { [stateKey]: 'idle', kitData: updatedData },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Section generation failed';
      console.error('[KitService] Section generation failed:', message);

      // 3. Mark as failed
      await KitModel.findByIdAndUpdate(kitId, { $set: { [stateKey]: 'failed' } });
    }
  }

  public static async regenerateSection(kit: IKitDoc, section: string, payload: any): Promise<ManagedKit> {
    if (!kit.kitData) throw new Error('Kit data is empty');
    
    const providerName = payload?.provider || 'gemini';
    const llm = LLMProviderFactory.createProvider(providerName);
    const updatedData: ManagedKit = JSON.parse(JSON.stringify(kit.kitData)); // deep copy

    if (section === 'company_brief') {
      const companyBrief = await llm.generateJSON<any>(`
        Generate a brief summary of the company based on this context:
        ${kit.raw_context || 'No specific context available.'}
        
        Respond in JSON: { "summary": "...", "what_they_do": "..." }
      `, {});
      updatedData.company_brief.summary = companyBrief?.summary || updatedData.company_brief.summary;
      updatedData.company_brief.what_they_do = companyBrief?.what_they_do || updatedData.company_brief.what_they_do;
    }
    else if (section === 'schedule') {
      const studyDays = payload?.study_days ? Number(payload.study_days) : kit.study_days || 5;
      
      // Update the DB if study days changed so it persists for future references
      if (studyDays !== kit.study_days) {
        await KitModel.updateOne({ _id: kit._id }, { $set: { study_days: studyDays } });
        kit.study_days = studyDays; // Update in memory for the scheduler
      }

      const scheduler = new DeterministicScheduler();
      const newSchedule = scheduler.allocate(studyDays, kit.kitData.role.requirements, kit.kitData.questions);
      updatedData.schedule = newSchedule;
    }
    else if (section === 'category') {
      const targetCategory = payload?.category;
      if (!targetCategory) throw new Error('Category is required for category regeneration');
      
      const currentQuestions = kit.kitData.questions || [];
      const preservedForCategory = currentQuestions.filter(
        (q: ManagedQuestion) => q.category === targetCategory && (q.metadata?.is_pinned || q.metadata?.is_edited)
      );
      const otherCategories = currentQuestions.filter((q: ManagedQuestion) => q.category !== targetCategory);
      
      const coveredReqIds = new Set(preservedForCategory.flatMap(q => q.requirement_ids));
      const uncoveredReqs = kit.kitData.role.requirements.filter(r => !coveredReqIds.has(r.id));
      
      const questionGen = new QuestionGenerator(llm);
      // We pass the raw context to generate new questions specifically for this category and uncovered reqs
      let newQuestions = await questionGen.generateQuestions(uncoveredReqs, kit.raw_context || '');
      
      // Force them to be the correct category (sometimes the LLM ignores the prompt)
      newQuestions = newQuestions.map(q => ({ ...q, category: targetCategory as any }));
      
      const managedNewQuestions = newQuestions.map(q => ({
        ...q,
        metadata: { origin: 'regenerated' as const, is_pinned: false, is_edited: false, user_modified_at: null }
      }));
      
      updatedData.questions = [...otherCategories, ...preservedForCategory, ...managedNewQuestions];
    }
    else if (section === 'flashcards') {
      const currentFlashcards = kit.kitData.flashcards || [];
      const preserved = currentFlashcards.filter(
        (f: ManagedFlashcard) => f.metadata?.is_pinned || f.metadata?.is_edited
      );
      
      const flashcardGen = new FlashcardGenerator(llm);
      const newFlashcards = await flashcardGen.generateFlashcards(kit.kitData.questions);
      
      const managedNewFlashcards = newFlashcards.map(f => ({
        ...f,
        metadata: { origin: 'regenerated' as const, is_pinned: false, is_edited: false, user_modified_at: null }
      }));
      
      updatedData.flashcards = [...preserved, ...managedNewFlashcards];
    }
    
    return updatedData;
  }

  /**
   * Decorates raw generated Kit items with management metadata.
   */
  private static decorateWithMetadata(kit: Kit): ManagedKit {
    const questions: ManagedQuestion[] = kit.questions.map((q) => ({
      ...q,
      metadata: {
        origin: 'generated' as const,
        is_pinned: false,
        is_edited: false,
        user_modified_at: null,
      },
    }));

    const flashcards: ManagedFlashcard[] = kit.flashcards.map((f) => ({
      ...f,
      metadata: {
        origin: 'generated' as const,
        is_pinned: false,
        is_edited: false,
        user_modified_at: null,
      },
    }));

    return { ...kit, questions, flashcards };
  }
}
