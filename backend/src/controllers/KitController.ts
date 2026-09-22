import { Request, Response } from 'express';
import { KitModel } from '../models/Kit';
import { KitGenerationOrchestrator } from '../pipeline/orchestrator/KitGenerationOrchestrator';

const orchestrator = new KitGenerationOrchestrator();

export class KitController {
  public static async createKit(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { job_description, company_url, role_name, study_days, provider } = req.body;
      const jd = job_description;
      const companyUrl = company_url;
      const roleName = role_name || '';
      const days = study_days;
      const llmProvider = provider || 'gemini';

      if (!jd || !companyUrl || !days) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Create empty kit placeholder
      const kitDoc = new KitModel({
        userId,
        title: `${roleName || 'Prep Kit'} @ ${companyUrl}`,
        status: 'generating',
        job_description: jd,
        company_url: companyUrl,
        role_name: roleName,
        study_days: days
      });
      await kitDoc.save();

      // Return immediately for async generation
      res.status(202).json({ _id: kitDoc._id, message: 'Kit generation started' });

      // Run generation in background
      (async () => {
        try {
          const generatedKit = await orchestrator.generateKit(jd, companyUrl, days, llmProvider, roleName);
          
          // Add metadata to generated kit elements (origin: generated, etc.)
          const managedKit: any = { ...generatedKit };
          managedKit.questions = generatedKit.questions.map(q => ({ ...q, metadata: { origin: 'generated', is_pinned: false, is_edited: false, user_modified_at: null } }));
          managedKit.flashcards = generatedKit.flashcards.map(f => ({ ...f, metadata: { origin: 'generated', is_pinned: false, is_edited: false, user_modified_at: null } }));

          await KitModel.findByIdAndUpdate(kitDoc._id, {
            status: 'completed',
            kitData: managedKit
          });
        } catch (error: any) {
          console.error("Background kit generation failed:", error);
          await KitModel.findByIdAndUpdate(kitDoc._id, {
            status: 'failed',
            error: error.message || 'Generation failed'
          });
        }
      })();
    } catch (e) {
      res.status(500).json({ error: 'Failed to start kit generation' });
    }
  }

  public static async retryKit(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const kitId = req.params.id;
      const { provider } = req.body;
      const llmProvider = provider || 'gemini';

      const kit = await KitModel.findOne({ _id: kitId, userId });
      if (!kit) {
        res.status(404).json({ error: 'Kit not found' });
        return;
      }
      
      if (!kit.job_description || !kit.company_url || !kit.study_days) {
        res.status(400).json({ error: 'Cannot retry this kit. Missing original job description or URL in database.' });
        return;
      }

      // Reset state to generating
      kit.status = 'generating';
      kit.error = undefined;
      await kit.save();

      // Return immediately
      res.status(202).json({ message: 'Kit generation restarted' });

      // Run generation in background
      (async () => {
        try {
          // Tell typescript these are certainly strings/numbers now
          const jd = kit.job_description as string;
          const companyUrl = kit.company_url as string;
          const days = kit.study_days as number;
          const roleName = kit.role_name || '';

          const generatedKit = await orchestrator.generateKit(jd, companyUrl, days, llmProvider, roleName);
          
          const managedKit: any = { ...generatedKit };
          managedKit.questions = generatedKit.questions.map(q => ({ ...q, metadata: { origin: 'generated', is_pinned: false, is_edited: false, user_modified_at: null } }));
          managedKit.flashcards = generatedKit.flashcards.map(f => ({ ...f, metadata: { origin: 'generated', is_pinned: false, is_edited: false, user_modified_at: null } }));

          await KitModel.findByIdAndUpdate(kit._id, {
            status: 'completed',
            kitData: managedKit
          });
        } catch (error: any) {
          console.error("Background kit generation failed during retry:", error);
          await KitModel.findByIdAndUpdate(kit._id, {
            status: 'failed',
            error: error.message || 'Generation failed'
          });
        }
      })();
    } catch (e) {
      res.status(500).json({ error: 'Failed to retry kit generation' });
    }
  }

  public static async getKits(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const kits = await KitModel.find({ userId }).select('-kitData').sort({ createdAt: -1 });
      res.json(kits);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch kits' });
    }
  }

  public static async getKitStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const kitId = req.params.id;
      const kit = await KitModel.findOne({ _id: kitId, userId }).select('status');

      if (!kit) {
        res.status(404).json({ error: 'Kit not found' });
        return;
      }

      res.json({ _id: kit._id, status: kit.status });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch kit status' });
    }
  }

  public static async getKit(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const kitId = req.params.id;
      const kit = await KitModel.findOne({ _id: kitId, userId });
      
      if (!kit) {
        res.status(404).json({ error: 'Kit not found' });
        return;
      }
      
      res.json(kit);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch kit' });
    }
  }

  public static async updateKitData(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const kitId = req.params.id;
      const { kitData } = req.body;

      if (!kitData) {
        res.status(400).json({ error: 'Missing kitData payload' });
        return;
      }

      const kit = await KitModel.findOne({ _id: kitId, userId });
      if (!kit) {
        res.status(404).json({ error: 'Kit not found' });
        return;
      }

      kit.kitData = kitData;
      await kit.save();

      res.status(200).json({ message: 'Kit updated successfully', kit });
    } catch (e: any) {
      console.error("Failed to update kit:", e);
      res.status(500).json({ error: 'Failed to update kit' });
    }
  }

  public static async deleteKit(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const kitId = req.params.id;

      const kit = await KitModel.findOneAndDelete({ _id: kitId, userId });
      if (!kit) {
        res.status(404).json({ error: 'Kit not found' });
        return;
      }

      res.status(200).json({ message: 'Kit deleted successfully' });
    } catch (e: any) {
      console.error("Failed to delete kit:", e);
      res.status(500).json({ error: 'Failed to delete kit' });
    }
  }

  public static async regenerateSection(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const kitId = req.params.id;
      const { section, payload } = req.body;

      const kit = await KitModel.findOne({ _id: kitId, userId });
      if (!kit || kit.status !== 'completed' || !kit.kitData) {
        res.status(404).json({ error: 'Kit not found or not completed' });
        return;
      }

      // Extract existing state to preserve pinned/edited items
      const currentQuestions = payload?.items || kit.kitData.questions || [];
      const currentFlashcards = payload?.items || kit.kitData.flashcards || [];

      let updatedData = { ...kit.kitData };

      if (section === 'questions') {
        const preservedQuestions = currentQuestions.filter((q: any) => q.metadata?.is_pinned || q.metadata?.is_edited);
        
        const newQId = `q_regen_${Date.now()}`;
        const newQuestions = [
          ...preservedQuestions,
          {
            id: newQId,
            requirement_ids: [],
            category: 'technical' as const,
            prompt: 'Newly regenerated question based on feedback',
            answer_outline: 'Regenerated outline',
            difficulty: 2 as const,
            metadata: { origin: 'regenerated' as const, is_pinned: false, is_edited: false, user_modified_at: null }
          }
        ];
        updatedData.questions = newQuestions;
      } else if (section === 'flashcards') {
        const preserved = currentFlashcards.filter((f: any) => f.metadata?.is_pinned || f.metadata?.is_edited);
        updatedData.flashcards = [
          ...preserved,
          {
            id: `f_regen_${Date.now()}`,
            requirement_ids: [],
            front: 'Regenerated front',
            back: 'Regenerated back',
            metadata: { origin: 'regenerated' as const, is_pinned: false, is_edited: false, user_modified_at: null }
          }
        ];
      }

      await KitModel.findByIdAndUpdate(kitId, { kitData: updatedData });
      res.json({ message: 'Section regenerated successfully', kitData: updatedData });
    } catch (e) {
      res.status(500).json({ error: 'Failed to regenerate section' });
    }
  }
}
