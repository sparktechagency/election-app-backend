import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { createAgent, emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import xlsx from 'xlsx';
import crypto from 'crypto';
import QueryBuilder from '../../builder/QueryBuilder';
import { unlinkSync } from 'fs';
import { IChangePassword } from '../../../types/auth';
import { compare, hash } from 'bcrypt';
import config from '../../../config';

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  if (!payload.password){
  payload.password = crypto.randomBytes(4).toString('hex');
  payload.passwordShow = payload.password;
  }
  payload.verified = true
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }
  //send email

  // const emailTamplate = createAgent({
  //   name: createUser.name,
  //   email: createUser.email,
  //   password: payload.password,
  //   code:createUser.represent_code!
  // })
  // await emailHelper.sendEmail(emailTamplate)
  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const createAgentsByExcelSheet = async (filePath:string)=>{
    const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
      const formatData = data.map((item:any) => ({
        name:item['Name'],
        email:item['Email'],
        contact:item['Contact No'],
        role:USER_ROLES.AGENT,
        postalCode:item['Post Code'],
        pollingStation:item['Pooling Address'],
      }));

      const BATCH_SIZE = 100;
      for (let i = 0; i < formatData.length; i += BATCH_SIZE) {
        const batch = formatData.slice(i, i + BATCH_SIZE);
        for (const agent of batch) {
          const exist = await User.findOne({ email: agent.email });
          if (!exist) {
            const createUser = await createUserToDB(agent);
            if (!createUser) {
              throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
            }
          }
        }
      }

      unlinkSync(filePath);

      return "agents created successfully"
      
}


const userListData = async (query:Record<string,any>)=>{
  const AgentQuery = new QueryBuilder(User.find({}),query).paginate().sort().search(['name','email','contact','postalCode','pollingStation','represent_code']).filter()
  const [agens,pagination]= await Promise.all([
    AgentQuery.modelQuery.lean(),
    AgentQuery.getPaginationInfo()
  ])
  return {agens,pagination}
}

const updateUserData = async (id:string,payload:Partial<IUser>)=>{
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if(payload.image){
    unlinkFile(isExistUser.image);
  }
  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return updateDoc;
}

const lockUnlockUser = async (id:string)=>{
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const updateDoc = await User.findOneAndUpdate({ _id: id }, {
    status: isExistUser.status === 'active' ? 'delete' : 'active'
  }, {
    new: true,
  });
  return updateDoc;
}

const deleteUser = async (id:string)=>{
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  unlinkFile(isExistUser.image);
  const deleteDoc = await User.findOneAndDelete({ _id: id });
  return deleteDoc;
}

const changeAgentPassword = async (id:string,payload:Partial<IChangePassword>)=>{
  const isExistUser = await User.findOne({_id:id}).select('+password').lean()
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const isMatch = await compare(payload.currentPassword!, isExistUser.password);

  if (!isMatch) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  const hashPassword = await hash(payload.newPassword!, config.bcrypt_salt_rounds!);
  const updateDoc = await User.findOneAndUpdate({ _id: id }, {
    password: hashPassword,
    passwordShow: payload.newPassword
  }, {
    new: true,
  });
  return updateDoc;
  
}

const getUserData = async (id:string)=>{
  const isExistUser = await User.findOne({_id:id}).select('+passwordShow').lean()
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  return isExistUser;
}

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  createAgentsByExcelSheet,
  userListData,
  updateUserData,
  lockUnlockUser,
  deleteUser,
  changeAgentPassword,
  getUserData
};
