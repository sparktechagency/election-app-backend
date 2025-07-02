import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { getSingleFilePath } from "../../../shared/getFilePath";
import { TeamService } from "./team.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createTeam = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files, 'image');
  const data = {
    ...req.body,
    image,
  };
  const result = await TeamService.createTeamToDB(data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Team created successfully',
    data: result,
  });
});

const getAllTeam = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamService.getAllTeamFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Team retrieved successfully',
    data: result,
  });
});

const updateTeam = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const image = getSingleFilePath(req.files, 'image');
  const data = {
    ...req.body,
    image,
  };
  const result = await TeamService.updateTeamToDB(id, data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Team updated successfully',
    data: result,
  });
});

const deleteTeam = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TeamService.deleteTeamToDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Team deleted successfully',
    data: result,
  });
});


export const TeamController = {
  createTeam,
  getAllTeam,
  updateTeam,
  deleteTeam,
};