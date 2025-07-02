import { model, Schema } from "mongoose";
import { IPolling, PollingModal } from "./polling.interface";
import { POLLING_STATUS } from "../../../enums/polling";

const pollinShcema = new Schema<IPolling,PollingModal>({
  station: {
    type: Schema.Types.ObjectId,
    ref: 'PollingStation',
    required: true,
  },
  agent: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  document: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  status:{
    type: String,
    enum: Object.values(POLLING_STATUS),
    default: POLLING_STATUS.PENDING,

  },
  polls: [
    {
      team: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      votes: {
        type: Number,
        required: true,
      },
    },
  ],
},{
    timestamps: true,
});

pollinShcema.index({image:1})

export const Polling = model<IPolling, PollingModal>('Polling', pollinShcema);