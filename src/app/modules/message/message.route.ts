import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { MessageController } from './message.controller';
import { MessageValidation } from './message.validation';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.route('/')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(MessageValidation.createMessageZodSchema),
    MessageController.sendMessage
  )
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    MessageController.getMessage
  );

export const MessageRoutes = router;