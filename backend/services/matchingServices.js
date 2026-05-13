import Match from "../models/Match.js";
import Pet from "../models/Pet.js";
import Adopter from "../models/Adopter.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateSingleMatch(user, pet) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

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

export async function generateBulkMatchForUser(user) {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let success = false;
  let attempts = 0;

  try {
    const allAvailablePets = await Pet.find({ adoptedStatus: { $ne: true } });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
    You are a pet matchmaker the best in the world.
      Adopter: ${JSON.stringify(user)}
      Pet: ${JSON.stringify(allAvailablePets)}
      
      Return ONLY a valid Array of JSON objects with a {"id":".." , "score":  (number 0-100)} format
    `;

    while (!success && attempts < 3) {
      try {
        const result = await model.generateContent(prompt);
        // With responseMimeType: "application/json", you often don't need the regex replace,
        // but it's safe to keep it just in case.
        const cleanJson = result.response
          .text()
          .replace(/```json|```/g, "")
          .trim();

        const scores = JSON.parse(cleanJson);
        const mongodbBulkOps = scores.map((match) => ({
          updateOne: {
            filter: { adopterID: user._id, petID: match.id },
            update: { $set: { score: match.score } },
            upsert: true,
          },
        }));

        await Match.bulkWrite(mongodbBulkOps);
        success = true;
      } catch (err) {
        if (
          err.status === 429 ||
          (err.message && err.message.includes("429"))
        ) {
          attempts++;
          await sleep(2000 * attempts);
        } else {
          console.error("Scoring Error: ", err);
          break; // <-- ADDED: Breaks the loop so it doesn't spin infinitely on a 500 error
        }
      }
    }
  } catch (err) {
    console.log("Error generating matches", err.message);
  }
}

// Renamed this function to avoid the duplicate name error
export async function generateBulkMatchForPet(pet) {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let success = false;
  let attempts = 0;

  try {
    const allUsers = await Adopter.find({ _id: { $ne: pet.ownerId } });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
    You are a pet matchmaker the best in the world.
      Pet: ${JSON.stringify(pet)}
      Adopter: ${JSON.stringify(allUsers)}
      
      Return ONLY a valid Array of JSON objects with a {"id":".." , "score":  (number 0-100)} format
    `;

    while (!success && attempts < 3) {
      try {
        const result = await model.generateContent(prompt);
        const cleanJson = result.response
          .text()
          .replace(/```json|```/g, "")
          .trim();

        const scores = JSON.parse(cleanJson);
        const mongodbBulkOps = scores.map((match) => ({
          updateOne: {
            filter: { adopterID: match.id, petID: pet._id }, // <-- FIXED: changed match._id to match.id
            update: { $set: { score: match.score } },
            upsert: true,
          },
        }));

        await Match.bulkWrite(mongodbBulkOps);
        success = true;
      } catch (err) {
        if (
          err.status === 429 ||
          (err.message && err.message.includes("429"))
        ) {
          attempts++;
          await sleep(2000 * attempts);
        } else {
          console.error("Scoring Error: ", err);
          break; // <-- ADDED: Breaks the loop to prevent infinite loop
        }
      }
    }
  } catch (err) {
    console.log("Error generating matches", err.message);
  }
}
