import { Model } from "mongoose";

export type ITeam = {
  name: string;
  image: string;
};

export type TeamModel = Model<ITeam, Record<string, unknown>>;