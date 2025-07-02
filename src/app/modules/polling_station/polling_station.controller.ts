import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PollingStationService } from "./polling_station.service";
import sendResponse from "../../../shared/sendResponse";
import { getSingleFilePath } from "../../../shared/getFilePath";
import path from "path";
const createPollingStationByExcelSheet = catchAsync(
  async (req: Request, res: Response) => {

    const fileData = getSingleFilePath(req.files,"doc")
    const filePath = path.join(process.cwd(),'uploads',fileData!);

    const result = await PollingStationService.createStationIntoDBByExcelSheet(filePath);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Polling Station created successfully",
      data: result,
    });
  })

const createPollingStation = catchAsync(async (req: Request, res: Response) => {
  const { ...pollingStationData } = req.body;
  const result = await PollingStationService.createPollingStation(
    pollingStationData
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Polling Station created successfully",
    data: result,
  });
});

const updatePollingStation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ...pollingStationData } = req.body;
  const result = await PollingStationService.updatePollingStation(
    id,
    pollingStationData
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Polling Station updated successfully",
    data: result,
  });
});

const deletePollingStation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PollingStationService.deletePollingStation(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Polling Station deleted successfully",
    data: result,
  });
});

const getPollingStations = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
  const result = await PollingStationService.getPollingStations(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Polling Station fetched successfully",
    data: result.data,
    pagination: result.pagination,
  });
});


export const PollingStationController = {
    createPollingStationByExcelSheet,
    createPollingStation,
    updatePollingStation,
    deletePollingStation,
    getPollingStations,
}