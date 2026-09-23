import { KitModel } from '../models/Kit';
import { KitGenerationOrchestrator } from '../pipeline/orchestrator/KitGenerationOrchestrator';
import { Kit, ManagedKit, ManagedQuestion, ManagedFlashcard } from '../types/schemas';

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
      const generatedKit = await orchestrator.generateKit(
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
   * Decorates raw generated Kit items with management metadata.
   * Converts Kit → ManagedKit by tagging each question and flashcard
   * with origin, pinned, and edited state.
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
