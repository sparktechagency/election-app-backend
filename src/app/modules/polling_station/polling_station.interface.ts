import { Model } from "mongoose";

export type IPollingStation = {
    stationCode: string;
    country: string;
    region: string;
    department: string;
    commune: string;
    city: string;
    name: string;
};

export type PollingStationModal = {
} & Model<IPollingStation>;

