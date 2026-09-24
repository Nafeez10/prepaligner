import { Request, Response } from 'express';
import { KitModel } from '../models/Kit';
import { KitService } from '../services/KitService';

export class KitController {
  static async createKit(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const { job_description, company_url, role_name, study_days, provider } = req.body;

      const kitDoc = new KitModel({
        userId,
        title: `${role_name} @ ${company_url}`,
        status: 'generating',
        job_description,
        company_url,
        role_name,
        study_days,
      });
      await kitDoc.save();

      res.status(202).json({ _id: kitDoc._id, message: 'Kit generation started' });

      KitService.runGeneration({
        kitId: String(kitDoc._id),
        jd: job_description,
        companyUrl: company_url,
        days: study_days,
        provider,
        roleName: role_name,
      });
    } catch {
      res.status(500).json({ error: 'Failed to start kit generation' });
    }
  }

  static async retryKit(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const kitId = req.params.id;
      const { provider } = req.body;

      const kit = await KitModel.findOne({ _id: kitId, userId });
      if (!kit) {
        res.status(404).json({ error: 'Kit not found' });
        return;
      }

      if (!kit.job_description || !kit.company_url || !kit.study_days) {
        res.status(400).json({
          error: 'Cannot retry this kit. Missing original job description or URL.',
        });
        return;
      }

      kit.status = 'generating';
      kit.error = undefined;
      await kit.save();

      res.status(202).json({ message: 'Kit generation restarted' });

      KitService.runGeneration({
        kitId: String(kit._id),
        jd: kit.job_description,
        companyUrl: kit.company_url,
        days: kit.study_days,
        provider,
        roleName: kit.role_name || '',
      });
    } catch {
      res.status(500).json({ error: 'Failed to retry kit generation' });
    }
  }

  static async getKits(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const kits = await KitModel.find({ userId }).select('-kitData').sort({ createdAt: -1 });
      res.json(kits);
    } catch {
      res.status(500).json({ error: 'Failed to fetch kits' });
    }
  }

  static async getKitStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const kit = await KitModel.findOne({ _id: req.params.id, userId }).select('status regeneration_states');
      if (!kit) {
        res.status(404).json({ error: 'Kit not found' });
        return;
      }
      res.json({ _id: kit._id, status: kit.status, regeneration_states: kit.regeneration_states });
    } catch {
      res.status(500).json({ error: 'Failed to fetch kit status' });
    }
  }

  static async getKit(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const kit = await KitModel.findOne({ _id: req.params.id, userId });
      if (!kit) {
        res.status(404).json({ error: 'Kit not found' });
        return;
      }
      res.json(kit);
    } catch {
      res.status(500).json({ error: 'Failed to fetch kit' });
    }
  }

  static async updateKitData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const { kitData } = req.body;

      const kit = await KitModel.findOne({ _id: req.params.id, userId });
      if (!kit) {
        res.status(404).json({ error: 'Kit not found' });
        return;
      }

      kit.kitData = kitData;
      await kit.save();

      res.status(200).json({ message: 'Kit updated successfully', kit });
    } catch {
      res.status(500).json({ error: 'Failed to update kit' });
    }
  }

  // --- Granular Update Methods ---

  static async updateCompanyBrief(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { company_brief } = req.body;
      const kit = await KitModel.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { $set: { 'kitData.company_brief': company_brief } },
        { new: true }
      );
      if (!kit) {
        res.status(404).json({ error: 'Kit not found' });
        return;
      }
      res.status(200).json({ message: 'Company brief updated', kit });
    } catch {
      res.status(500).json({ error: 'Failed to update company brief' });
    }
  }

  static async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const kit = await KitModel.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { $set: { 'kitData.role': role } },
        { new: true }
      );
      if (!kit) { res.status(404).json({ error: 'Kit not found' }); return; }
      res.status(200).json({ message: 'Role updated', kit });
    } catch { res.status(500).json({ error: 'Failed to update role' }); }
  }

  static async updateQuestionsArray(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { questions } = req.body;
      const kit = await KitModel.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { $set: { 'kitData.questions': questions } },
        { new: true }
      );
      if (!kit) { res.status(404).json({ error: 'Kit not found' }); return; }
      res.status(200).json({ message: 'Questions updated', kit });
    } catch { res.status(500).json({ error: 'Failed to update questions' }); }
  }

  static async createQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { question } = req.body;
      const kit = await KitModel.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { $push: { 'kitData.questions': question } },
        { new: true }
      );
      if (!kit) { res.status(404).json({ error: 'Kit not found' }); return; }
      res.status(201).json({ message: 'Question created', kit });
    } catch { res.status(500).json({ error: 'Failed to create question' }); }
  }

  static async updateQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { id, questionId } = req.params;
      const { question } = req.body;
      
      const setObj: Record<string, any> = {};
      for (const key of Object.keys(question)) {
        setObj[`kitData.questions.$.${key}`] = question[key];
      }

      const kit = await KitModel.findOneAndUpdate(
        { _id: id, userId: req.user.userId, 'kitData.questions.id': questionId },
        { $set: setObj },
        { new: true }
      );
      if (!kit) { res.status(404).json({ error: 'Kit or Question not found' }); return; }
      res.status(200).json({ message: 'Question updated', kit });
    } catch { res.status(500).json({ error: 'Failed to update question' }); }
  }

  static async deleteQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { id, questionId } = req.params;
      const kit = await KitModel.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { $pull: { 'kitData.questions': { id: questionId } as any } },
        { new: true }
      );
      if (!kit) { res.status(404).json({ error: 'Kit not found' }); return; }
      res.status(200).json({ message: 'Question deleted', kit });
    } catch { res.status(500).json({ error: 'Failed to delete question' }); }
  }

  static async updateFlashcardsArray(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { flashcards } = req.body;
      const kit = await KitModel.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { $set: { 'kitData.flashcards': flashcards } },
        { new: true }
      );
      if (!kit) { res.status(404).json({ error: 'Kit not found' }); return; }
      res.status(200).json({ message: 'Flashcards updated', kit });
    } catch { res.status(500).json({ error: 'Failed to update flashcards' }); }
  }

  static async createFlashcard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { flashcard } = req.body;
      const kit = await KitModel.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { $push: { 'kitData.flashcards': flashcard } },
        { new: true }
      );
      if (!kit) { res.status(404).json({ error: 'Kit not found' }); return; }
      res.status(201).json({ message: 'Flashcard created', kit });
    } catch { res.status(500).json({ error: 'Failed to create flashcard' }); }
  }

  static async updateFlashcard(req: Request, res: Response): Promise<void> {
    try {
      const { id, flashcardId } = req.params;
      const { flashcard } = req.body;
      
      const setObj: Record<string, any> = {};
      for (const key of Object.keys(flashcard)) {
        setObj[`kitData.flashcards.$.${key}`] = flashcard[key];
      }

      const kit = await KitModel.findOneAndUpdate(
        { _id: id, userId: req.user.userId, 'kitData.flashcards.id': flashcardId },
        { $set: setObj },
        { new: true }
      );
      if (!kit) { res.status(404).json({ error: 'Kit or Flashcard not found' }); return; }
      res.status(200).json({ message: 'Flashcard updated', kit });
    } catch { res.status(500).json({ error: 'Failed to update flashcard' }); }
  }

  static async deleteFlashcard(req: Request, res: Response): Promise<void> {
    try {
      const { id, flashcardId } = req.params;
      const kit = await KitModel.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { $pull: { 'kitData.flashcards': { id: flashcardId } as any } },
        { new: true }
      );
      if (!kit) { res.status(404).json({ error: 'Kit not found' }); return; }
      res.status(200).json({ message: 'Flashcard deleted', kit });
    } catch { res.status(500).json({ error: 'Failed to delete flashcard' }); }
  }

  static async deleteKit(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const kit = await KitModel.findOneAndDelete({ _id: req.params.id, userId });
      if (!kit) {
        res.status(404).json({ error: 'Kit not found' });
        return;
      }
      res.status(200).json({ message: 'Kit deleted successfully' });
    } catch {
      res.status(500).json({ error: 'Failed to delete kit' });
    }
  }

  static async regenerateSection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const { section, payload } = req.body;

      const kit = await KitModel.findOne({ _id: req.params.id, userId });
      if (!kit || kit.status !== 'completed' || !kit.kitData) {
        res.status(404).json({ error: 'Kit not found or not completed' });
        return;
      }

      const stateKey = section === 'category'
        ? `regeneration_states.questions.category.${payload?.category}`
        : `regeneration_states.${section}`;

      // Synchronously mark as generating so frontend polling kicks in instantly
      await KitModel.findByIdAndUpdate(kit._id, { $set: { [stateKey]: 'generating' } });

      // Fire and forget — run LLM in background
      KitService.runSectionGeneration(kit, section, payload);

      res.status(202).json({ message: 'Section regeneration started' });
    } catch {
      res.status(500).json({ error: 'Failed to start section regeneration' });
    }
  }
}
