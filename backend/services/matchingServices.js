import Match from "../models/Match.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateSingleMatch(user, pet) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are a pet matchmaker the best in the world.
      Adopter: ${JSON.stringify(user)}
      Pet: ${JSON.stringify(pet)}
      
      Return ONLY a valid JSON object with a 'score' (number 0-100)
    `;

    const result = await model.generateContent(prompt);
    const cleanJson = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    const { score } = JSON.parse(cleanJson);

    await Match.findOneAndUpdate(
      {
        adopterID: user._id,
        petID: pet._id,
      },
      { $set: { score: score } },
      { upsert: true, new: true },
    );
  } catch (err) {
    console.log("Error generating matches", err.message);
  }
}
