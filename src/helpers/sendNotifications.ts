import { Socket } from "socket.io";
import { INotification } from "../app/modules/notifcation/notification.interface";
import { Notification } from "../app/modules/notifcation/notification.model";
import { USER_ROLES } from "../enums/user";
import { User } from "../app/modules/user/user.model";

export const sendNotification= async (data:INotification)=>{
    const notification = await Notification.create(data)
    const io = (global as any).io as Socket;

    for (const reciever of data.recievers) {
      io.emit(`sendNotification::${reciever}`, notification);
    }
}

export const sendAdminNotifications = async (data:INotification)=>{
    const admins = (await User.find({role:{
        $in:[USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN]
    }},{_id:1}).lean()).map((item)=>item._id)
    data.recievers = admins
    const notification = await Notification.create(data)
    const io = (global as any).io as Socket;
    for (const reciever of data.recievers) {
      io.emit(`sendNotification::${reciever}`, notification);
    }

}