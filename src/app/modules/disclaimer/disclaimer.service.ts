import { IDisclaimer } from "./disclaimer.interface";
import { Disclaimer } from "./disclaimer.model";

const createDisclaimerToDB = async (payload: IDisclaimer) => {
    const isExist = await Disclaimer.findOne({ type: payload.type });
    if (isExist) {
       return await Disclaimer.findByIdAndUpdate(isExist._id, payload,{new:true});
    }
    const result = await Disclaimer.create(payload);
    return result;
};

const getDisclaimerFromDB = async (type: string) => {
    const result = await Disclaimer.findOne({ type });
    return result;
};

export const DisclaimerService = {
    createDisclaimerToDB,
    getDisclaimerFromDB,
};