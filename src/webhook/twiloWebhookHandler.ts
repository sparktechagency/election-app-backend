import { Request, Response } from "express";
import { DocumentService } from "../app/modules/document/document.service";

export const TwiloWebhookHandler = async (req: Request, res: Response) => {
    const { body } = req;
    const { MessageSid, From, Body } = body;
    console.log(`MessageSid: ${MessageSid}`);
    await DocumentService.makePollingBySMS(Body);
    res.status(200).send('OK');
}