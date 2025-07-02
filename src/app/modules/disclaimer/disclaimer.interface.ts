import { Model } from "mongoose";

export type IDisclaimer = {
    content:string;
    type:"privacy" | "terms" | "about"
}

export type DisclaimerModel = Model<IDisclaimer, Record<string, unknown>>;