import { Model } from "mongoose";

export type IFaq = {
  question: string;
  answer: string;
};

export type FaqModal = Model<IFaq, Record<string, unknown>>;

