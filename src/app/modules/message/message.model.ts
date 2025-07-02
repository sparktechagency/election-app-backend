import { model, Schema } from "mongoose";
import { IMessage, MessageModel } from "./message.interface";

const messageSchema = new Schema<IMessage, MessageModel>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    reciver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


export const Message = model<IMessage, MessageModel>('Message', messageSchema);