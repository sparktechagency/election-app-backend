import { z } from "zod";

const createDocumentZodSchema = z.object({
  body: z.object({
    image: z.any(),
    title: z.string({
      required_error: 'Title is required',
    }),
    note: z.string().optional(),
  }),
});


const createDocumentScanZOdSchema = z.object({
  body: z.object({
    image: z.string(),
    document: z.string({
      required_error: 'Document is required',
    }),
  }),
});

export const DocumentValidation = {
  createDocumentZodSchema,
  createDocumentScanZOdSchema,
};