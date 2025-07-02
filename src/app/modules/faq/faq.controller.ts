import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { FaqService } from "./faq.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createFaq = catchAsync(async (req: Request, res: Response) => {
  const { ...faqData } = req.body;
  const faq = await FaqService.createFaqToDb(faqData);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Faq created successfully",
    data: faq,
  });
});

const getFaqs = catchAsync(async (req: Request, res: Response) => {
  const faqs = await FaqService.getFaqsFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Faqs fetched successfully",
    data: faqs,
  });
});

const updateFaq = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ...faqData } = req.body;
  const faq = await FaqService.updateFaqToDb(id, faqData);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Faq updated successfully",
    data: faq,
  });
});

const deleteFaq = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const faq = await FaqService.deleteFaqToDb(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Faq deleted successfully",
    data: faq,
  });
});

export const FaqController = {
  createFaq,
  getFaqs,
  updateFaq,
  deleteFaq,
};