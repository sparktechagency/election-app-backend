import { model, Schema } from "mongoose";
import { FaqModal, IFaq } from "./faq.interface";

const faqSchema = new Schema<IFaq, FaqModal>(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Faq = model<IFaq, FaqModal>("Faq", faqSchema);