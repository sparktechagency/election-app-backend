import { model, Schema } from "mongoose";
import { DOCUMENT_STATUS, DocumentModal, IDocument } from "./document.interface";

const documentSchema = new Schema<IDocument,DocumentModal>({
    station: {
        type: Schema.Types.ObjectId,
        ref: 'PollingStation',
        required: true
    },
    agent: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    images: {
        type: [String],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    note: {
        type: String
    },
    status: {
        type: String,
        enum: Object.values(DOCUMENT_STATUS),
        default: DOCUMENT_STATUS.PENDING
    }
}, {
    timestamps: true
})
export const Document = model<IDocument, DocumentModal>('Document', documentSchema)