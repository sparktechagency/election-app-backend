import { model, Schema } from "mongoose";
import { INotification, NotificationModel } from "./notification.interface";

const notificationSchema = new Schema<INotification,NotificationModel>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    recievers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    readers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

export const Notification = model<INotification,NotificationModel>(
  'Notification',
  notificationSchema
);