import Match from "../models/Match.js";
import Pet from "../models/Pet.js";
import Adopter from "../models/Adopter.js";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import mongoose from "mongoose";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chunkArray = (array, size) => {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
};
const BATCH_SIZE = 25;
export async function generateSingleMatch(user, pet) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

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
    console.log("Error generating matches", err);
  }
}

export async function generateBulkMatchForUser(user) {
  console.log("Generating Bulk Matches for user");
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    const allAvailablePets = await Pet.find({
      adoptedStatus: { $ne: false },
      ownerId: { $ne: user._id },
    });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              score: { type: SchemaType.INTEGER },
            },
            required: ["id", "score"],
          },
        },
      },
    });
    const cleanUser = {
      _id: user._id,
      bio: user.bio,
      age: user.age,
      occupation: user.occupation,
      income: user.income,
      address: user.address,
      contactInfo: user.contactInfo,
      livingCon: user.livingCon,
      lifeStyle: user.lifeStyle,
      householdMem: user.householdMem,
      currentOwnedPets: user.currentOwnedPets,
      hobbies: user.hobbies,
      gender: user.gender,
      hadPets: user.hadPets,
    };

    const cleanPets = allAvailablePets.map((pet) => ({
      _id: pet._id,
      ownerId: pet.ownerId,
      name: pet.name,
      age: pet.age,
      bio: pet.bio,
      sex: pet.sex,
      species: pet.species,
      breed: pet.breed,
      size: pet.size,
      weight: pet.weight,
      vaccination: pet.vaccination,
      sn: pet.sn,
      healthCond: pet.healthCond,
      behavior: pet.behavior,
      specialNeeds: pet.specialNeeds,
      otherInfo: pet.otherInfo,
    }));
    const petBatches = chunkArray(cleanPets, BATCH_SIZE);
    for (const batch of petBatches) {
      let success = false;
      let attempts = 0;

      const prompt = `
        You are the best pet matchmaker in the world.
        Adopter: ${JSON.stringify(cleanUser)}
        Pets: ${JSON.stringify(batch)}
        
        Return ONLY a valid Array of JSON objects formatting the pet's _id as id: [{"id":".." , "score": (number 0-100)}]
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
              filter: {
                adopterID: user._id,
                petID: new mongoose.Types.ObjectId(match.id),
              },

              update: { $set: { score: match.score } },
              upsert: true,
            },
          }));

          // Write to DB per batch to save memory
          if (mongodbBulkOps.length > 0) {
            console.log("bulkwrite for user", mongodbBulkOps);

            await Match.bulkWrite(mongodbBulkOps);
          }

          success = true;

          // Optional: Small delay between successful batches to respect API rate limits
          await sleep(1000);
        } catch (err) {
          if (
            err.status === 429 ||
            (err.message && err.message.includes("429"))
          ) {
            attempts++;
            await sleep(2000 * attempts);
          } else {
            console.error("Scoring Error in Batch: ", err);
            break; // Break the while loop and move to the next batch
          }
        }
      }
    }
  } catch (err) {
    console.error("Error generating matches", err);
  }
}

// Renamed this function to avoid the duplicate name error
export async function generateBulkMatchForPet(pet) {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  console.log("Generating Bulk Matches for Pet");

  try {
    const allUsers = await Adopter.find({ _id: { $ne: pet.ownerId } });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              score: { type: SchemaType.INTEGER },
            },
            required: ["id", "score"],
          },
        },
      },
    });
    const cleanUsers = allUsers.map((user) => ({
      _id: user._id,
      bio: user.bio,
      age: user.age,
      occupation: user.occupation,
      income: user.income,
      address: user.address,
      contactInfo: user.contactInfo,
      livingCon: user.livingCon,
      lifeStyle: user.lifeStyle,
      householdMem: user.householdMem,
      currentOwnedPets: user.currentOwnedPets,
      hobbies: user.hobbies,
      gender: user.gender,
      hadPets: user.hadPets,
    }));

    const cleanPet = {
      _id: pet._id,
      ownerId: pet.ownerId,
      name: pet.name,
      age: pet.age,
      bio: pet.bio,
      sex: pet.sex,
      species: pet.species,
      breed: pet.breed,
      size: pet.size,
      weight: pet.weight,
      vaccination: pet.vaccination,
      sn: pet.sn,
      healthCond: pet.healthCond,
      behavior: pet.behavior,
      specialNeeds: pet.specialNeeds,
      otherInfo: pet.otherInfo,
    };
    const userBatches = chunkArray(cleanUsers, BATCH_SIZE);
    for (const batch of userBatches) {
      let success = false;
      let attempts = 0;

      const prompt = `
        You are the best pet matchmaker in the world.
        Pet: ${JSON.stringify(cleanPet)}
        Adopters: ${JSON.stringify(batch)}
        
        Return ONLY a valid Array of JSON objects formatting the adopter's _id as id: [{"id":".." , "score": (number 0-100)}]
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
              filter: {
                adopterID: new mongoose.Types.ObjectId(match.id),
                petID: pet._id,
              },
              update: { $set: { score: match.score } },
              upsert: true,
            },
          }));

          // 4. Write to the database per batch
          if (mongodbBulkOps.length > 0) {
            console.log("bulkwrite for pet", mongodbBulkOps);
            await Match.bulkWrite(mongodbBulkOps);
          }

          success = true;

          // Optional buffer to prevent hitting Google's rate limits
          await sleep(1000);
        } catch (err) {
          if (
            err.status === 429 ||
            (err.message && err.message.includes("429"))
          ) {
            attempts++;
            await sleep(2000 * attempts);
          } else {
            console.error("Scoring Error in Batch: ", err);
            break; // Break the while loop to move on to the next batch
          }
        }
      }
    }
  } catch (err) {
    console.error("Error generating matches", err);
  }
}
