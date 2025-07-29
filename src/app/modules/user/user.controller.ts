import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import path from 'path';
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const image = getSingleFilePath(req.files, 'image');
    const { ...userData } = req.body;

    if (image) {
      userData.image = image;
    }
    const result = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  }
);

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');

    const data = {
      image,
      ...req.body,
    };
    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

const createAgentsFromSheet = catchAsync(
  async (req: Request, res: Response) => {
    const doc = getSingleFilePath(req.files, 'doc');
    const filePath = path.join(process.cwd(), 'uploads', doc!);
    const result = await UserService.createAgentsByExcelSheet(filePath);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Agents created successfully',
      data: result,
    });
  }
);

const agentsList = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await UserService.userListData(query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Agents retrieved successfully',
    data: result.agens,
    pagination: result.pagination,
  });
});

const updateAgentData = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const image = getSingleFilePath(req.files, 'image');
  console.log(image);
  
  const data = req.body;
  data.image = image;
  const result = await UserService.updateUserData(id, data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Agent data updated successfully',
    data: result,
  });
});

const lockAgent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.lockUnlockUser(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Agent locked successfully',
    data: result,
  });
});
const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.deleteUser(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin deleted successfully',
    data: result,
  });
});

const changeAgentPassword = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body;
  const result = await UserService.changeAgentPassword(id, body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Agent password changed successfully',
    data: result,
  });
});

const userData = catchAsync(async (req: Request, res: Response) => {
  const query = req.params.id;
  const result = await UserService.getUserData(query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Agents retrieved successfully',
    data: result,

  });
});

const addStationInAdmins = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body;
  const result = await UserService.addStationInAdmins(id, body.stations);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Station added successfully',
    data: result,
  });
})
export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  createAgentsFromSheet,
  agentsList,
  updateAgentData,
  lockAgent,
  deleteAdmin,
  changeAgentPassword,
  userData,
  addStationInAdmins
};
