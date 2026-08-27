import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from '../validators/auth.validator';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.put('/profile', validate(updateProfileSchema), UserController.updateProfile);
router.put('/change-password', validate(changePasswordSchema), UserController.changePassword);

export default router;
