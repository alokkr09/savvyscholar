import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createExpenseSchema,
  updateExpenseSchema,
  queryExpenseSchema,
} from '../validators/expense.validator';

const router = Router();

// Protect all expense routes
router.use(authenticate);

router.post('/', validate(createExpenseSchema), ExpenseController.create);
router.get('/', validate(queryExpenseSchema, 'query'), ExpenseController.list);
router.get('/summary', ExpenseController.getSummary);
router.get('/:id', ExpenseController.getById);
router.put('/:id', validate(updateExpenseSchema), ExpenseController.update);
router.delete('/:id', ExpenseController.delete);

export default router;
