import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IUser = {
  name: string;
  role: USER_ROLES;
  contact: string;
  email: string;
  password: string;
  postalCode?: string;
  image?: string;
  status: 'active' | 'delete';
  pollingStation?: string;
  verified: boolean;
  address?: string;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  gender: 'male' | 'female'|"";
  dob: Date;  
  represent_code?: string;
  passwordShow?:string;
  stationCode?:string;
  country?:string;
  occupation?:string;
  stations?:Types.ObjectId[]

};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
