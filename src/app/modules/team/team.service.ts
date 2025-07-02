import unlinkFile from "../../../shared/unlinkFile";
import { ITeam } from "./team.interface";
import { Team } from "./team.model";

const createTeamToDB = async (payload: ITeam) => {
  const result = await Team.create(payload);
  return result;
};

const getAllTeamFromDB = async (query: Record<string, any>) => {
const search = query.searchTerm || "";
  const result = await Team.find({
    $or: [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
    ],
  });
  return result;
};

const updateTeamToDB = async (id: string, payload: Partial<ITeam>) => {
    const existingTeam = await Team.findById(id);
    if(payload.image){
        unlinkFile(existingTeam?.image!)
    }
  const result = await Team.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

const deleteTeamToDB = async (id: string) => {
  const result = await Team.findByIdAndDelete(id);
  if (result) {
    unlinkFile(result.image);
  }
  return result;
};

export const TeamService = {
  createTeamToDB,
  getAllTeamFromDB,
  updateTeamToDB,
  deleteTeamToDB,
};
