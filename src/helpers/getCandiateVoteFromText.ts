import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';
import { Team } from '../app/modules/team/team.model';
const googleGenerativeAI = new GoogleGenerativeAI(config.gemeni.apy_key!);
const model = googleGenerativeAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});
export async function getVotesFromText(text: string) {
  const teams = (await Team.find({}, { name: 1, _id: 1}))
  console.log(teams);
  

  const prompt = `This is a list of teams in the election: ${teams}. and there is the content where is the votes descreption: ${text}. 
                    Please extract the votes from the text and return the votes in the format of an array of objects with the following properties: id, name, votes, votesInWords and in id use _id of teams array. and we are extracting this data from a image so i thing its will be have some spelling mistake so please match with my teams name and fix the spelling and dont give me any kinds of explaination or any other text just return the data in the format of an array of objects with the following properties: _id, name, votes, votesInWords and in id use _id of teams array. only the json and dont give null or any other text. `;

  const response = await model.generateContent(prompt);

  const textData = response.response.text()
  console.log(textData);
  

  // Remove any code block formatting
  const cleanJson = textData.replace(/```json|```/g, '').trim();
  const jsonData = JSON.parse(cleanJson);
  return jsonData;
}
