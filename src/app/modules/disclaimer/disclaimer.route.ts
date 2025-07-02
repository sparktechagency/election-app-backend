import express from 'express';
import { DisclaimerController } from './disclaimer.controller';
import validateRequest from '../../middlewares/validateRequest';
import { DisclaimerValidation } from './disclaimer.validation';
const router = express.Router();
router.route("/")
  .post(validateRequest(DisclaimerValidation.createDisclaimerZodSchema), DisclaimerController.createDisclaimer)
  .get(DisclaimerController.getDisclaimer)

export const DisclaimerRoutes = router;