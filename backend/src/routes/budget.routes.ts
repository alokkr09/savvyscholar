import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBudgetSchema, updateBudgetSchema } from '../validators/budget.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createBudgetSchema), BudgetController.upsert);
router.get('/', BudgetController.list);
router.put('/:id', validate(updateBudgetSchema), BudgetController.update);
router.delete('/:id', BudgetController.delete);

export default router;
