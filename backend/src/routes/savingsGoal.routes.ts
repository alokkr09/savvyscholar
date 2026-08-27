import { Router } from 'express';
import { SavingsGoalController } from '../controllers/savingsGoal.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  depositWithdrawSchema,
} from '../validators/savings.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createSavingsGoalSchema), SavingsGoalController.create);
router.get('/', SavingsGoalController.list);
router.get('/:id', SavingsGoalController.getById);
router.put('/:id', validate(updateSavingsGoalSchema), SavingsGoalController.update);
router.patch('/:id/transaction', validate(depositWithdrawSchema), SavingsGoalController.depositOrWithdraw);
router.delete('/:id', SavingsGoalController.delete);

export default router;
