import { model, Schema } from "mongoose";
import { IPollingStation, PollingStationModal } from "./polling_station.interface";

const pollingStationSchema = new Schema<IPollingStation, PollingStationModal>(
  {
    stationCode: {
      type: String,
      required: true,
      unique: true,
    },
    country: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    commune: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const PollingStation = model<IPollingStation, PollingStationModal>(
  "PollingStation",
  pollingStationSchema
);