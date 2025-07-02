import express from 'express';
import { PollingStationController } from './polling_station.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { PollingStationValidation } from './polling_station.validation';
const router = express.Router();
router.post('/excel',fileUploadHandler(), PollingStationController.createPollingStationByExcelSheet);

router.route("/")
    .post(validateRequest(PollingStationValidation.createPollingStationZodSchema),PollingStationController.createPollingStation)
    .get(PollingStationController.getPollingStations)

router.route("/:id")
    .patch(validateRequest(PollingStationValidation.updatePollingStationZodSchema),PollingStationController.updatePollingStation)
    .delete(PollingStationController.deletePollingStation)

export const PollingStationRoutes = router;