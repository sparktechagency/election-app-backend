import express from 'express';
import { DocumentController } from './document.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { DocumentValidation } from './document.validation';
const router = express.Router();

router.route('/')
    .post(auth(USER_ROLES.AGENT),fileUploadHandler(),validateRequest(DocumentValidation.createDocumentZodSchema), DocumentController.createDocument)
    .get(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN,USER_ROLES.AGENT), DocumentController.getAllDocuments);

router.route('/scan')
    .post(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN,USER_ROLES.AGENT),fileUploadHandler(),validateRequest(DocumentValidation.createDocumentScanZOdSchema), DocumentController.scanDocuments);
router.get("/for-agent",auth(USER_ROLES.AGENT), DocumentController.getDocumetForAgent);
router.post("/text-vote", DocumentController.getPollingBySMS);
router.route('/:id')
    .get(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN,USER_ROLES.AGENT), DocumentController.getSingleDocument)
    .patch(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN), DocumentController.publishDocuments)
export const DocumentRoutes = router;