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
      const kit = await KitModel.findOne({ _id: req.params.id, userId }).select('status');
      if (!kit) {
        res.status(404).json({ error: 'Kit not found' });
        return;
      }
      res.json({ _id: kit._id, status: kit.status });
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

      const updatedData = await KitService.regenerateSection(kit, section, payload);

      await KitModel.findByIdAndUpdate(req.params.id, { kitData: updatedData });
      res.json({ message: 'Section regenerated successfully', kitData: updatedData });
    } catch {
      res.status(500).json({ error: 'Failed to regenerate section' });
    }
  }
}
