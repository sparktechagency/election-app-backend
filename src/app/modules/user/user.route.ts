import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import { AuthValidation } from '../auth/auth.validation';
const router = express.Router();

router
  .route('/profile')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.AGENT,USER_ROLES.SUPER_ADMIN), UserController.getUserProfile)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.AGENT),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = UserValidation.updateUserZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      return UserController.updateProfile(req, res, next);
    }
  );

router
  .route('/')
  .post(
    fileUploadHandler(),
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  ).get(auth(USER_ROLES.SUPER_ADMIN,USER_ROLES.ADMIN),UserController.agentsList)

router.route('/change-password/:id').patch(auth(USER_ROLES.SUPER_ADMIN,USER_ROLES.ADMIN),validateRequest(AuthValidation.createChangePasswordZodSchema),UserController.changeAgentPassword)

router.delete("/delete-admin/:id",auth(USER_ROLES.SUPER_ADMIN),UserController.deleteAdmin)

router.post("/agent-excel",auth(USER_ROLES.SUPER_ADMIN,USER_ROLES.ADMIN),fileUploadHandler(),UserController.createAgentsFromSheet)



router.route('/:id')
  .put(auth(USER_ROLES.SUPER_ADMIN,USER_ROLES.ADMIN),fileUploadHandler(),UserController.updateAgentData)
  .patch(auth(USER_ROLES.SUPER_ADMIN,USER_ROLES.ADMIN),UserController.lockAgent)
  .get(auth(USER_ROLES.SUPER_ADMIN,USER_ROLES.ADMIN),UserController.userData)


export const UserRoutes = router;
