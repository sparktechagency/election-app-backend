import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { DocumentService } from "./document.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { getMultipleFilesPath } from "../../../shared/getFilePath";
import path from "path";
const createDocument = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const images = getMultipleFilesPath(req.files,"image")
  const payload = req.body;
  payload.images = images;
  const result = await DocumentService.createDocumentIntoDB(user, payload);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Document created successfully',
    data: result,
  });
});
const getAllDocuments = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const query = req.query;
  const result = await DocumentService.getAllDocuments(query,user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Documents fetched successfully',
    data: result.data,
    pagination:result.paginationInfo
  });
});
const getSingleDocument = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DocumentService.getSingleDocument(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Document fetched successfully',
    data: result,
  });
});

const scanDocuments = catchAsync(async (req: Request, res: Response) => {
  const { image,document } = req.body;
  
  
  const result = await DocumentService.scanDocuments(image,document);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Document scanned successfully',
    data: result,
  });
});

const publishDocuments = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DocumentService.publishDocuments(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Document published successfully',
    data: result,
  });
});
const getPollingBySMS = catchAsync(async (req: Request, res: Response) => {
  const { text } = req.body;
  const result = await DocumentService.makePollingBySMS(text);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Polling fetched successfully',
    data: result,
  });
});

const getDocumetForAgent = catchAsync(async (req: Request, res: Response) => {
  const result = await DocumentService.getAllDocumentsForAgent(req.user,req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Document fetched successfully',
    data: result.documents,
    pagination:result.pagination
  });
});

const updateDocument = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DocumentService.updateDocumentFromBD(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Document updated successfully',
    data: result,
  });
});
export const DocumentController = {
  createDocument,
  getAllDocuments,
  getSingleDocument,
  scanDocuments,
  publishDocuments,
  getPollingBySMS,
  getDocumetForAgent,
  updateDocument,
};