import express from "express";
import { FaqController } from "./faq.controller";
import validateRequest from "../../middlewares/validateRequest";
import { FaqValidation } from "./faq.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
const router = express.Router();

router.route("/")
  .post(
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    validateRequest(FaqValidation.createFaqZodSchema),
    FaqController.createFaq
  )
  .get(FaqController.getFaqs);


router.route("/:id")
  .patch(
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    validateRequest(FaqValidation.updateFaqZodSchema),
    FaqController.updateFaq
  )
  .delete(
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    FaqController.deleteFaq
    );

export const FaqRoutes = router;