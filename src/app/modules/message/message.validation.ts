import { z } from "zod";

const createMessageZodSchema = z.object({
  body: z.object({
    message: z.string({ required_error: 'Message is required' }),
    recievers: z.array(z.string({ required_error: 'Recievers is required' }),{required_error:'Recievers is required'})
  }),
});


export const MessageValidation = {
  createMessageZodSchema,
};