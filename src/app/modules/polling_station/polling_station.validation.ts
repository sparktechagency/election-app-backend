import { z } from "zod";

const createPollingStationZodSchema = z.object({
  body: z.object({
    stationCode: z.string({
      required_error: 'Station Code is required',
    }),
    country: z.string({
      required_error: 'Country is required',
    }),
    region: z.string({
      required_error: 'Region is required',
    }),
    department: z.string({
      required_error: 'Department is required',
    }),
    commune: z.string({
      required_error: 'Commune is required',
    }),
    city: z.string({
      required_error: 'City is required',
    }),
    name: z.string({
      required_error: 'Name is required',
    }),
  }),
});

const updatePollingStationZodSchema = z.object({
  body: z.object({
    stationCode: z.string().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    department: z.string().optional(),
    commune: z.string().optional(),
    city: z.string().optional(),
    name: z.string().optional(),
  }),
});

export const PollingStationValidation = {
  createPollingStationZodSchema,
  updatePollingStationZodSchema,
};