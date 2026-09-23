import { Router } from 'express';
import { KitController } from '../controllers/KitController';
import validate from '../middleware/validate';
import {
  CreateKitSchema,
  RetryKitSchema,
  UpdateKitDataSchema,
  RegenerateSectionSchema,
} from './kit.schemas';

const router = Router();

router.post('/', validate(CreateKitSchema), KitController.createKit);
router.get('/', KitController.getKits);
router.get('/:id/status', KitController.getKitStatus);
router.get('/:id', KitController.getKit);
router.delete('/:id', KitController.deleteKit);
router.put('/:id/data', validate(UpdateKitDataSchema), KitController.updateKitData);
router.post('/:id/retry', validate(RetryKitSchema), KitController.retryKit);
router.post('/:id/regenerate-section', validate(RegenerateSectionSchema), KitController.regenerateSection);

export default router;
