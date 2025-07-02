import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { Message } from "./message.model";
import { sendNotification } from "../../../helpers/sendNotifications";
import QueryBuilder from "../../builder/QueryBuilder";

const sendMessageToDB = async (user:JwtPayload,message:string,recievers:string[])=>{
    const recieversId = recievers.map((reciever)=>new Types.ObjectId(reciever))
    for (const reciever of recieversId) {
        await Message.create({
            sender:user.id,
            message,
            reciver:reciever
        })
    }
    await sendNotification({
        title:"Message from ADMIN",
        message,
        recievers:recieversId
    })
    return {
        message:'Message sent successfully'
    }
}

const getMessageFromDB = async (query:Record<string,any>)=>{
    const MessageQuery = new QueryBuilder(Message.find(),query).paginate().sort()
    const [messages,pagination]= await Promise.all([
        MessageQuery.modelQuery.populate('reciver','name'),
        MessageQuery.getPaginationInfo()
    ])
    return {
        messages,
        pagination
    }
}

export const MessageService = {
    sendMessageToDB,
    getMessageFromDB
}