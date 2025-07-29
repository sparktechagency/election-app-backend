import express from 'express';
import { PollingController } from './polling.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();

router.route('/')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), PollingController.getPollingInfo);

router.route('/summury')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), PollingController.getPollingSummery);

router.route('/:id')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), PollingController.pendindDocuments)
  .patch(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), PollingController.updatePolling);

export const PollingRoutes = router;