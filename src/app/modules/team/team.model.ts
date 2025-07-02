import { model, Schema } from "mongoose";
import { ITeam, TeamModel } from "./team.interface";

const teamSchema = new Schema<ITeam, TeamModel>(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


export const Team = model<ITeam, TeamModel>("Team", teamSchema);