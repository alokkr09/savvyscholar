import { Router } from 'express';
import { InsuranceController } from '../controllers/insurance.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createInsuranceSchema,
  updateInsuranceSchema,
} from '../validators/insurance.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createInsuranceSchema), InsuranceController.create);
router.get('/', InsuranceController.list);
router.get('/:id', InsuranceController.getById);
router.put('/:id', validate(updateInsuranceSchema), InsuranceController.update);
router.delete('/:id', InsuranceController.delete);

export default router;
