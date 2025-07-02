import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PollingService } from "./polling.service";
import sendResponse from "../../../shared/sendResponse";

const pendindDocuments = catchAsync(async (req:Request, res:Response) => {
  const { id } = req.params;
  const result = await PollingService.getDocumentPendingPollingFromDb(
    id
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "pending polling data",
    data: result,
  });
});

const getPollingInfo = catchAsync(async (req:Request, res:Response) => {
  const query = req.query;
  const result = await PollingService.getPollingInfoFromDb(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "polling data",
    data: result.data,
    pagination: result.paginationInfo
  });
})

const getPollingSummery = catchAsync(async (req:Request, res:Response) => {
  const result = await PollingService.getPollingSummery();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "polling data",
    data: result,
  });
})

export const PollingController = {
  pendindDocuments,
  getPollingInfo,
  getPollingSummery
};

