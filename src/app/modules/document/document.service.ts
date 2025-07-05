import { JwtPayload } from 'jsonwebtoken';
import { CandidateVote, DOCUMENT_STATUS, IDocument } from './document.interface';
import { User } from '../user/user.model';
import { PollingStation } from '../polling_station/polling_station.model';
import { Document } from './document.model';
import { sendAdminNotifications } from '../../../helpers/sendNotifications';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enums/user';
import { Types } from 'mongoose';
import { inhenceImages } from '../../../helpers/inhenceImageHelper';
import Tesseract from 'tesseract.js';
import { getVotesFromText } from '../../../helpers/getCandiateVoteFromText';
import { Polling } from '../polling/polling.model';
import path from 'path';
import { POLLING_STATUS } from '../../../enums/polling';
import ApiError from '../../../errors/ApiError';
import vison from "@google-cloud/vision"
const keyPath = path.join(process.cwd(), 'keys','crm.json');
const visionClient = new vison.ImageAnnotatorClient({
  keyFilename: keyPath,
});
const createDocumentIntoDB = async (user: JwtPayload, payload: IDocument) => {
  const userData = await User.findOne({ _id: user.id }).lean();

  if (!userData) {
    throw new ApiError(404,'User not found');
  }

  if (!userData.stationCode) {
    throw new ApiError(400,'User is not a polling station agent');
  }

  const pollingStation = await PollingStation.findOne({
    stationCode: userData.stationCode,
  }).lean();
  if (!pollingStation) {
    throw new ApiError(404,'Polling station not found');
  }

  payload.images = await inhenceImages(payload.images);

  const document = await Document.create({
    station: pollingStation._id,
    agent: userData._id,
    images: payload.images,
    note: payload.note,
    title: payload.title,
  });

  await sendAdminNotifications({
    title: `New document uploaded by ${userData.name} from ${pollingStation.name}`,
    message: `${userData.name} from ${pollingStation.name} has uploaded a new document`,
    recievers: [],
  });
  return document;
};

const getAllDocuments = async (
  query: Record<string, any>,
  user: JwtPayload
) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;
  const search = query.searchTerm || '';
  const queryData =
    user.role == USER_ROLES.ADMIN ? {} : { agent: new Types.ObjectId(user.id) };
  const DocumentQuery = await Document.aggregate([
    {
      $match: {
        ...queryData,
        $or: [
          {
            'station.name': {
              $regex: search,
              $options: 'i',
            },
          },
          {
            'agent.name': {
              $regex: search,
              $options: 'i',
            },
          },
          {
            title: {
              $regex: search,
              $options: 'i',
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'pollingstations',
        localField: 'station',
        foreignField: '_id',
        as: 'station',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'agent',
        foreignField: '_id',
        as: 'agent',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: '$station',
    },
    {
      $unwind: '$agent',
    },
    {
      $project: {
        _id: 1,
        station: 1,
        agent: 1,
        images: 1,
        title: 1,
        note: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  const paginationInfo = {
    page: page,
    limit: limit,
    total: await Document.countDocuments(),
  };
  return {
    paginationInfo,
    data: DocumentQuery,
  };
};

const getSingleDocument = async (id: string) => {
  const document = await Document.findById(id).populate(['station', 'agent']);
  if (!document) {
    throw new Error('Document not found');
  }
  return document;
};

const scanDocuments = async (filePath: string, documentId: string) => {
  const newFilePath = path.join(process.cwd(), 'uploads', filePath);
  const data = await visionClient.textDetection(newFilePath);
  const text = data[0]?.fullTextAnnotation?.text;
 
  const document = await Document.findById(documentId);
  if (!document) {
    throw new ApiError(404,'Document not found');
  }
  if(document.status === DOCUMENT_STATUS.APPROVED){
    throw new ApiError(400,'Document already scanned');
  }
  await Polling.deleteMany({ image: filePath,status:POLLING_STATUS.PENDING });
//   const { data } = await Tesseract.recognize(newFilePath, 'eng');
//   const text = data.text;
  const formattedText = text?.replace(/\n/g, ' ');
// console.log(formattedText);

  const response: CandidateVote[] = await getVotesFromText(formattedText??"");

  const polling = await Polling.create({
    station: document.station,
    agent: document.agent,
    document: document._id,
    image: filePath,
    polls: response.map(vote => {
      return {
        team: vote._id,
        votes: vote.votes,
        name: vote.name,
      };
    }),
  });

  return polling;
};


const publishDocuments = async (documentId: string) => {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new ApiError(404,'Document not found');
  }

  await Polling.updateMany(
    { document: documentId, status: POLLING_STATUS.PENDING },
    {
      status: POLLING_STATUS.PUBLISHED,
    }
  );

  return true
};

export const DocumentService = {
  createDocumentIntoDB,
  getAllDocuments,
  getSingleDocument,
  scanDocuments,
  publishDocuments,
};
