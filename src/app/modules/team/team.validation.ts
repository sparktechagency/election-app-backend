import { z } from "zod";

const createTeamZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    image: z.any({
      required_error: 'Image is required',
    }),
  }),
});

const updateTeamZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    image: z.any().optional(),
  }),
});
export const TeamValidation = {
  createTeamZodSchema,
  updateTeamZodSchema,
};