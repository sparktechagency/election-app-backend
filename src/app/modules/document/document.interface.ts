import { Model, Types } from "mongoose"

export type IDocument = {

    station:Types.ObjectId;
    agent:Types.ObjectId;
    images:string[];
    title:string;
    note?:string;
    status:DOCUMENT_STATUS

}

export enum DOCUMENT_STATUS{
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

export interface CandidateVote {
  _id: string;
  name: string;
  votes: number;
  votesInWords: string;
}


export type DocumentModal = Model<IDocument>