import xlsx from 'xlsx';
import fs  from 'fs';
import { PollingStation } from './polling_station.model';
import { IPollingStation } from './polling_station.interface';
import QueryBuilder from '../../builder/QueryBuilder';
const createStationIntoDBByExcelSheet = async (filePath: string) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    const pollingStations = data.map((row: any) => ({
        stationCode: row.CODE_BUREAU_VOTE,
        country: row.COUNTRYNAMEFR,
        region: row.REGIONNAMEFR,
        department: row.DEPTNAMEFR,
        commune: row.COMNAMEFR,
        city: row.CVNAMEFR,
        name: row.BVNAME,
    }));
   
    const BATCH_SIZE = 1000;
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const chunk = pollingStations.slice(i, i + BATCH_SIZE);
      await PollingStation.insertMany(chunk);
    }

    fs.unlinkSync(filePath);
    
}

const createPollingStation = async(payload:IPollingStation)=>{
    const station = await PollingStation.create(payload)
    return station

}

const updatePollingStation = async(id:string,payload:IPollingStation)=>{
    const station = await PollingStation.findOneAndUpdate({_id:id},payload,{new:true})
    return station
}

const deletePollingStation = async(id:string)=>{
    const station = await PollingStation.findByIdAndDelete(id)
    return station
}

const getPollingStations = async(query:Record<string,any>)=>{
    const StationQuery = new QueryBuilder(PollingStation.find(),query).paginate().sort().search(["country","region","department","commune","city","name",'stationCode'])
    const [data,pagination]= await Promise.all([
        StationQuery.modelQuery.lean(),
        StationQuery.getPaginationInfo()
    ])
    return {
        data,
        pagination
    }
}
export const PollingStationService = {
    createStationIntoDBByExcelSheet,
    createPollingStation,
    updatePollingStation,
    deletePollingStation,
    getPollingStations
}