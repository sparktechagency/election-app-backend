import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { MessageService } from "./message.service";
import sendResponse from "../../../shared/sendResponse";

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { message, recievers } = req.body;
  const result = await MessageService.sendMessageToDB(user, message, recievers);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Message sent successfully",
    data: result,
  });
})
const getMessage = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await MessageService.getMessageFromDB(query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Message fetched successfully",
    data: result.messages,
    pagination: result.pagination,
  });
})
export const MessageController = {
  sendMessage,
  getMessage
}