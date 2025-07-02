import { Model, Types } from "mongoose"
import { POLLING_STATUS } from "../../../enums/polling";

export type IPolling = {
    station:Types.ObjectId;
    agent: Types.ObjectId;
    document: Types.ObjectId;
    image: string;
    status:POLLING_STATUS
    polls:{
        team: Types.ObjectId;
        name: string;
        votes: number;
    }[]
}


export type PollingModal = Model<IPolling>


