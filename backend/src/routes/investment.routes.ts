import { Router } from 'express';
import { InvestmentController } from '../controllers/investment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createInvestmentSchema,
  updateInvestmentSchema,
} from '../validators/investment.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createInvestmentSchema), InvestmentController.create);
router.get('/', InvestmentController.list);
router.get('/:id', InvestmentController.getById);
router.put('/:id', validate(updateInvestmentSchema), InvestmentController.update);
router.delete('/:id', InvestmentController.delete);

export default router;
