import { IFaq } from "./faq.interface"
import { Faq } from "./faq.model"

const createFaqToDb = async(payload:IFaq)=>{
    const faq = await Faq.create(payload)
    return faq
}


const getFaqsFromDB = async()=>{
    const faqs = await Faq.find()
    return faqs
}


const updateFaqToDb = async(id:string,payload:IFaq)=>{
    const faq = await Faq.findOneAndUpdate({_id:id},payload,{new:true})
    return faq
}

const deleteFaqToDb = async(id:string)=>{
    const faq = await Faq.findByIdAndDelete(id)
    return faq
}

export const FaqService = {
    createFaqToDb,
    getFaqsFromDB,
    updateFaqToDb,
    deleteFaqToDb
}


