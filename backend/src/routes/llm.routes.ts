import { Router } from 'express';
import { LLMController } from '../controllers/LLMController';

const router = Router();

router.get('/providers', LLMController.getProviders);

export default router;
