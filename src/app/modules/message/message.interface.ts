import { Model, Types } from "mongoose";

export type IMessage = {
    sender : Types.ObjectId;
    message : string;
    reciver : Types.ObjectId;
}

export type MessageModel = Model<IMessage, Record<string, unknown>>;