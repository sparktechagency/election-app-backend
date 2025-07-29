import { POLLING_STATUS } from "../../../enums/polling";
import ApiError from "../../../errors/ApiError";
import QueryBuilder from "../../builder/QueryBuilder";
import { Polling } from "./polling.model";

const getDocumentPendingPollingFromDb = async (
  documentId: string
) => {
  const polling = await Polling.find({
    document: documentId,
    status: POLLING_STATUS.PENDING,
  }).populate([
    {
        path:'agent',
        select:'name postalCode'
    },
    {
        path:'station',
        select:'name'
    },
    {
        path:'polls.team',
        select:'name'
    }
  ])
  return polling;
};


const getPollingInfoFromDb = async (query: Record<string, any>) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;
  const search = query.searchTerm || '';

  const matchStage = {
    status: POLLING_STATUS.PUBLISHED,
  };

  const searchMatch = {
    $or: [
      { "station.name": { $regex: search, $options: 'i' } },
      { "station.city": { $regex: search, $options: 'i' } },
      { "agent.name": { $regex: search, $options: 'i' } },
      { "polls.team.name": { $regex: search, $options: 'i' } }
    ]
  };

  const result = await Polling.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'pollingstations',
        localField: 'station',
        foreignField: '_id',
        as: 'station',
        pipeline: [{ $project: { name: 1, city: 1, _id: 0 } }]
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'agent',
        foreignField: '_id',
        as: 'agent',
        pipeline: [{ $project: { name: 1, postalCode: 1, _id: 0 } }]
      }
    },
    {
      $project: {
        station: { $arrayElemAt: ["$station", 0] },
        agent: { $arrayElemAt: ["$agent", 0] },
        polls: 1,
        _id: 1,
        image: 1,
        status: 1,
        createdAt: 1
      }
    },
    { $match: searchMatch },
    {
      $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit }
        ],
        totalCount: [{ $count: 'count' }]
      }
    }
  ]);

  const data = result[0].data;
  const total = result[0].totalCount[0]?.count || 0;
  const totalPage = Math.ceil(total / limit);

  const paginationInfo = {
    page,
    limit,
    total,
    totalPage
  };

  return {
    data,
    paginationInfo
  };
};



const getPollingSummery = async ()=>{
    const pollingSummury = await Polling.aggregate([
        {
            $match:{
                status:POLLING_STATUS.PUBLISHED
            }
        },
        {
            $unwind:"$polls"
        },
        {
            $group:{
                _id:"$polls.team",
                total:{$sum:"$polls.votes"}
            }
        },
        {
            $lookup:{
                from:"teams",
                localField:"_id",
                foreignField:"_id",
                as:"team"
            }
        },
        {
            $project:{
                _id:1,
                total:1,
                team:{$arrayElemAt:["$team",0]}
            }
        },
        {
            $sort:{
                total:-1
            }
        }
    ])
    const totalVotes = pollingSummury.reduce((acc,curr)=>acc+curr.total,0)
    pollingSummury.forEach(item=>{
        item.percentage = parseFloat(((item.total/totalVotes)*100).toFixed(2))
    })
    return pollingSummury;
}

const updatePolling = async (pollingId: string, updateData: Record<string, any>) => {
    console.log(updateData);
    
  const polling = await Polling.findById(pollingId);
//   console.log(polling);
  
  if (!polling) {
    throw new ApiError(404, 'Polling not found');
  }
  const updatedPolling = await Polling.findByIdAndUpdate(pollingId, updateData, { new: true });
  return updatedPolling;
}


export const PollingService = {
  getDocumentPendingPollingFromDb,
  getPollingInfoFromDb,
  getPollingSummery,
  updatePolling
};