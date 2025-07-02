import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { Team } from './team.model';
import { TeamValidation } from './team.validation';
import { TeamController } from './team.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.route("/")
  .post(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),fileUploadHandler(), validateRequest(TeamValidation.createTeamZodSchema), TeamController.createTeam)
  .get(TeamController.getAllTeam)

router.route("/:id")
  .patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),fileUploadHandler(), validateRequest(TeamValidation.updateTeamZodSchema), TeamController.updateTeam)
  .delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), TeamController.deleteTeam)

export const TeamRoutes = router;