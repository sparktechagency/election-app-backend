import { JwtPayload } from 'jsonwebtoken';
import { CandidateVote, DOCUMENT_STATUS, ElectionResult, IDocument } from './document.interface';
import { User } from '../user/user.model';
import { PollingStation } from '../polling_station/polling_station.model';
import { Document } from './document.model';
import { sendAdminNotifications, sendNotification } from '../../../helpers/sendNotifications';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enums/user';
import { Types } from 'mongoose';
import { inhenceImages } from '../../../helpers/inhenceImageHelper';
import Tesseract from 'tesseract.js';
import { getVotesFromSMS, getVotesFromText } from '../../../helpers/getCandiateVoteFromText';
import { Polling } from '../polling/polling.model';
import path from 'path';
import { POLLING_STATUS } from '../../../enums/polling';
import ApiError from '../../../errors/ApiError';
import vison from "@google-cloud/vision"
import { create } from 'domain';
import { IPollingStation } from '../polling_station/polling_station.interface';
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
    path:"polling",
    refernceId: document._id,
  });
  await sendNotification({
    title:`Your document has been uploaded`,
    message: `Your document has been uploaded`,
    recievers: [userData._id],
    path:"polling",
    refernceId: document._id,
  })
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
  const isRecent = query.isRecent === 'true';
  const date = query.date || '';
  const userData = await User.findById(user.id);
  const stations = userData?.stations?.length?userData.stations:[];
  // 🔍 Role-based filter
  const AgentQuery = isRecent
    ? {
        agent: new Types.ObjectId(user.id),
        createdAt: {
          $lte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1),
        },
      }
    : { agent: new Types.ObjectId(user.id) };

  // 🗓️ Build Date Filter
  let dateFilter: Record<string, any> = {};
  if (date) {
    const start = new Date(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1); // end = next day

    dateFilter = {
      createdAt: {
        $gte: start,
        $lt: end,
      },
    };
  }
  const adminQuery = user.role==USER_ROLES.SUPER_ADMIN?{}:{"station._id":{$in:stations}}

  // 🧠 Combine Match Conditions
  const matchCondition: Record<string, any> = {
    ...( [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)
      ? adminQuery
      : AgentQuery ),
    ...dateFilter,
    $or: [
      { 'station.name': { $regex: search, $options: 'i' } },
      { 'station.stationCode': { $regex: search, $options: 'i' } },
      { 'agent.name': { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
    ],
  };

  // 🔁 Aggregation Pipeline
  const pipeline = [
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
        pipeline: [{ $project: { name: 1 } }],
      },
    },
    { $unwind: '$station' },
    { $unwind: '$agent' },
    { $match: matchCondition },
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
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  // 📊 Aggregated Data
  const data = await Document.aggregate(pipeline as any);

  // 📈 Count for Pagination
  const countPipeline = [
    ...pipeline.slice(0, 5), // up to $match
    { $match: matchCondition },
    { $count: 'total' },
  ];
  const totalCount = await Document.aggregate(countPipeline as any);
  const total = totalCount[0]?.total || 0;

  return {
    paginationInfo: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
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
  const ExistPolling = await Polling.findOne({ image: filePath,status:POLLING_STATUS.PUBLISHED });
  if(ExistPolling){
    throw new ApiError(400,'Polling already exist');
  }
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

const makePollingBySMS = async (text:string)=>{
  const response:ElectionResult = await getVotesFromSMS(text)
  if(!response.agentAndStationDetails){
    throw new ApiError(400,'Invalid SMS');
  }
  const agent = await User.findOne({represent_code:response.agentAndStationDetails.agentId})
  if(!agent){
    throw new ApiError(400,'Invalid SMS');
  }
  const station = await PollingStation.findOne({stationCode:response.agentAndStationDetails.stationId})
  if(!station){
    throw new ApiError(400,'Invalid SMS');
  }
  const polling = await Polling.create({
    station: station._id,
    agent: agent._id,
    document: null,
    status: POLLING_STATUS.PUBLISHED,
    image: null,
    polls: response.votes.map(vote => {
      return {
        team: vote._id,
        votes: vote.votes,
        name: vote.name,
      };
    }),
  });
  return polling
}


const getAllDocumentsForAgent =async (user:JwtPayload,query:Record<string,any>)=>{
  const isRecent = query.isRecent== 'true'
  const DocumentQuery = new QueryBuilder(Document.find(isRecent?{createdAt:{
    $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },agent:user.id}:{agent:user.id}),query).paginate().sort()

  const [documents,pagination]= await Promise.all([
    DocumentQuery.modelQuery.populate("station").lean(),
    DocumentQuery.getPaginationInfo()
  ])
  return {
    documents:await documents.map(document=>{
      const station = (document as any).station as IPollingStation
      return {
        ...document,
        address:`${station.name}, ${station.city}, ${station.commune}, ${station.region}`,
        station:station.name,
      }
    }),
    pagination
  }
}

const updateDocumentFromBD = async (
  id: string,
  payload: Partial<IDocument>
) => {
  const document = await Document.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!document) {
    throw new ApiError(404,'Document not found');
  }
  return document;
};




export const DocumentService = {
  createDocumentIntoDB,
  getAllDocuments,
  getSingleDocument,
  scanDocuments,
  publishDocuments,
  makePollingBySMS,
  getAllDocumentsForAgent,
  updateDocumentFromBD,
};
