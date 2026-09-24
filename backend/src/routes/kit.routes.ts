import { Router } from 'express';
import { KitController } from '../controllers/KitController';
import validate from '../middleware/validate';
import {
  CreateKitSchema,
  RetryKitSchema,
  UpdateKitDataSchema,
  RegenerateSectionSchema,
  UpdateCompanyBriefSchema,
  UpdateRoleSchema,
  CreateQuestionSchema,
  UpdateQuestionSchema,
  UpdateQuestionsArraySchema,
  CreateFlashcardSchema,
  UpdateFlashcardSchema,
  UpdateFlashcardsArraySchema,
} from './kit.schemas';

const router = Router();

router.post('/', validate(CreateKitSchema), KitController.createKit);
router.get('/', KitController.getKits);
router.get('/:id/status', KitController.getKitStatus);
router.get('/:id', KitController.getKit);
router.delete('/:id', KitController.deleteKit);

// Deprecated endpoint (to be removed after frontend migration)
router.put('/:id/data', validate(UpdateKitDataSchema), KitController.updateKitData);

// Granular Update Endpoints
router.patch('/:id/company-brief', validate(UpdateCompanyBriefSchema), KitController.updateCompanyBrief);
router.patch('/:id/role', validate(UpdateRoleSchema), KitController.updateRole);

router.put('/:id/questions', validate(UpdateQuestionsArraySchema), KitController.updateQuestionsArray);
router.post('/:id/questions', validate(CreateQuestionSchema), KitController.createQuestion);
router.put('/:id/questions/:questionId', validate(UpdateQuestionSchema), KitController.updateQuestion);
router.delete('/:id/questions/:questionId', KitController.deleteQuestion);

router.put('/:id/flashcards', validate(UpdateFlashcardsArraySchema), KitController.updateFlashcardsArray);
router.post('/:id/flashcards', validate(CreateFlashcardSchema), KitController.createFlashcard);
router.put('/:id/flashcards/:flashcardId', validate(UpdateFlashcardSchema), KitController.updateFlashcard);
router.delete('/:id/flashcards/:flashcardId', KitController.deleteFlashcard);

router.post('/:id/retry', validate(RetryKitSchema), KitController.retryKit);
router.post('/:id/regenerate-section', validate(RegenerateSectionSchema), KitController.regenerateSection);

export default router;
