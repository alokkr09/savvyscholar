import { Router } from 'express';
import { EmergencyFundController } from '../controllers/emergencyFund.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateEmergencyFundSchema,
  contributeEmergencyFundSchema,
} from '../validators/emergencyFund.validator';

const router = Router();

router.use(authenticate);

router.get('/', EmergencyFundController.get);
router.put('/', validate(updateEmergencyFundSchema), EmergencyFundController.update);
router.post('/contribute', validate(contributeEmergencyFundSchema), EmergencyFundController.contribute);

export default router;
