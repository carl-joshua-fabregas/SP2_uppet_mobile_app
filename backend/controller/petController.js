import Pet from "../models/Pet.js";
import AdoptionApplication from "../models/AdoptionApplication.js";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mongoose from "mongoose";

console.log("AWS REGION:", process.env.AWS_REGION);
console.log("AWS ACCESS KEY ID:", process.env.AWS_ACCESS_KEY_ID);
console.log("AWS SECRET ACCESS KEY:", process.env.AWS_SECRET_ACCESS_KEY);
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function createPet(req, res) {
  try {
    const {
      name,
      age,
      bio,
      sex,
      species,
      breed,
      size,
      weight,
      vaccination,
      sn,
      healthCond,
      behavior,
      specialNeeds,
      otherInfo,
      photos,
    } = req.body;

    const newPet = new Pet({
      ownerId: req.user.id,
      name: name,
      age: Number(age),
      bio: bio,
      sex: sex,
      species: species,
      breed: breed,
      size: size,
      weight: Number(weight),
      vaccination: vaccination,
      sn: sn,
      healthCond: healthCond,
      behavior: behavior,
      specialNeeds: specialNeeds,
      otherInfo: otherInfo,
      photos: photos,
    });
    console.log("REQUEST BODY", req.body);
    console.log("BEFORE PET GOT SAVED");

    const status = await newPet.save();
    console.log("PET GOT SAVED", status);
    return res.status(200).json({
      message: "Succesfully Added",
      body: status,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function findAll(req, res) {
  try {
    const allPets = await Pet.find({})
      .skip((req.query.page - 1) * 10)
      .limit(10);
    if (allPets.length == 0) {
      return res.status(200).json({
        message: "NO PETS FOUND",
        body: [],
      });
    }
    return res.status(200).json({
      message: "Successfully obtained all pets",
      body: allPets,
    });
    console.log("DONE");
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function findByID(req, res) {
  try {
    const petID = req.params.id;
    const pet = await Pet.findById(petID);

    if (!pet) {
      return res.status(404).json({
        message: "Pet not found",
      });
    }
    return res.status(200).json({
      message: "Successfully found Pet",
      body: pet,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function findByFilter(req, res) {
  console.log("FIND BY FILTER CALLED");
  try {
    const { age, breed, species, sex, size, weight, adoptionStatus } =
      req.query;

    const filter = {};

    if (age) filter.age = age;
    if (breed) filter.breed = breed;
    if (species) filter.species = species;
    if (sex) filter.sex = sex;
    if (size) filter.size = size;
    if (weight) filter.weight = weight;
    if (adoptionStatus) filter.adoptedStatus = adoptionStatus;

    const pet = await Pet.find(filter);

    if (pet.length == 0) {
      return res.status(400).json({
        message: "No pets found",
        body: pet,
      });
    }
    return res.status(200).json({
      message: "Found these pets",
      body: pet,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function findAllAvailPets(req, res) {
  try {
    const { limit, lastPetID, lastPetUpdate } = req.query;
    if (!lastPetID) {
      console.log("I am here");
      const avail = await Pet.find({ adoptedStatus: { $ne: true } })
        .sort({ updatedAt: -1 })
        .limit(limit);
      return res.status(200).json({
        message: "Successfully found available pets",
        body: avail,
      });
    }
    const avail = await Pet.find({
      adoptedStatus: { $ne: true },
      $or: [
        {
          updatedAt: { $lt: lastPetUpdate },
        },
        {
          updatedAt: lastPetUpdate,
          _id: { $lt: lastPetID },
        },
      ],
    }).sort({ updatedAt: -1, createdAt: -1 });
    console.log("Found pets:", avail.length);

    if (avail.length === 0) {
      console.log("Found pets are nothing");
      return res.status(200).json({
        message: "AVAILABLE PETS ARE EMPTY",
        body: [],
      });
    }
    console.log("SUCCESSFULL RETREIVAL");
    return res.status(200).json({
      message: "Successfully found all available pets",
      body: avail,
    });
  } catch (err) {
    console.log("Error in findAllAvailPets:", err);
    return res.status(500).json({
      message: "Server Error Meow",
      body: err.message,
    });
  }
}

export async function findMyPets(req, res) {
  try {
    const skip = (req.query.page - 1) * 10;
    // const myPets = await Pet.find({ ownerId: req.user.id })
    //   .skip((req.query.page - 1) * 10)
    //   .limit(10);
    const aggregatePets = await Pet.aggregate([
      { $match: { ownerId: new mongoose.Types.ObjectId(req.user.id) } },
      { $skip: skip },
      { $limit: 10 },
      {
        $lookup: {
          from: "adoptionapplications",
          localField: "_id",
          foreignField: "petToAdopt",
          as: "allApps",
        },
      },
      {
        $addFields: {
          applicationCount: { $size: "$allApps" },
          pendingCount: {
            $size: {
              $filter: {
                input: "$allApps",
                as: "app",
                cond: { $eq: ["$$app.status", "Pending"] }, // Double check if yours is "Pending" or "pending"
              },
            },
          },
        },
      },
      { $project: { allApps: 0 } },
    ]);
    if (aggregatePets.length == 0) {
      return res.status(200).json({
        message: "No pets found",
        body: [],
      });
    }
    return res.status(200).json({
      message: "Successfully found all your pets",
      body: aggregatePets,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Server Error Meow",
      body: err.message,
    });
  }
}

export async function deletePetByID(req, res) {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        message: "Pet not found",
      });
    }

    if (
      req.user.id.toString() !== pet.ownerId.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "FORBIDDEN",
      });
    }

    await AdoptionApplication.deleteMany({ petToAdopt: req.params.id });
    await Pet.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Successfully delete pet",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function deleteAll(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    await AdoptionApplication.deleteMany({});
    await Pet.deleteMany({});

    return res.status(200).json({
      message: "Deleted all pets in the database",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function updatePet(req, res) {
  try {
    const options = {
      new: true,
      runValidators: true,
    };

    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        message: "No pet to update found",
      });
    }

    if (
      pet.ownerId.toString() !== req.user.id.toString() &&
      req.user.role.toString() !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      options,
    );

    return res.status(200).json({
      message: "Successfully updated a pet",
      body: updatedPet,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function presignUploadURL(req, res) {
  try {
    const key = `pets/${req.body.petID}/${req.body.fileSize}_${req.body.fileName}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: req.body.fileType,
      // Metadata:{
      //   uri: req.body.uri || "",
      //   name: req.body.name || ""
      // }
    });
    console.log(
      process.env.AWS_BUCKET_NAME,
      process.env.AWS_REGION,
      process.env.AWS_ACCESS_KEY_ID,
      process.env.AWS_SECRET_ACCESS_KEY,
    );
    console.log("GENERATING PRESIGNED URL FOR KEY:", key);
    console.log("WITH COMMAND:", command);

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    console.log("PRESIGNED URL GENERATED:", url);
    const finalUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    console.log("FINAL URL GENERATED:", finalUrl);
    return res.status(200).json({
      message: "Successfully obtained presigned URL",
      body: { url: url, key: key, finalUrl: finalUrl },
    });
  } catch (err) {
    console.log("ERROR IN GENERATING PRESIGNED URL:", err);
    return res.status(505).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function presignDeleteURL(req, res) {
  try {
    console.log("GENERATING presignDeleteURL");
    const key = req.body.key;
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    console.log(
      process.env.AWS_BUCKET_NAME,
      process.env.AWS_REGION,
      process.env.AWS_ACCESS_KEY_ID,
      process.env.AWS_SECRET_ACCESS_KEY,
    );
    console.log("GENERATING PRESIGNED URL FOR KEY:", key);
    console.log("WITH COMMAND:", command);

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    console.log("PRESIGNED URL GENERATED:", url);

    return res.status(200).json({
      message: "Successfully obtained presigned URL",
      body: { url: url, key: key },
    });
  } catch (err) {
    console.log("ERROR IN GENERATING PRESIGNED URL:", err);
    return res.status(505).json({
      message: "Server Error",
      body: err.message,
    });
  }
}
export async function uploadPetPhoto(req, res) {
  console.log("UPLOAD PET PHOTO CONTROLLER CALLED");
  try {
    console.log("PET ID IN UPLOAD PET PHOTO CONTROLLER", req.params.id);

    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    if (
      pet.ownerId.toString() !== req.user.id.toString() &&
      req.user.role.toString() !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const uploadedPhotos = req.body.photos.map((p) => ({
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${p.key}`,
      key: p.key,
      caption: p.caption,
      isProfile: p.isProfile,
      timeStamp: p.timeStamp,
    }));

    console.log("BACKED END HERE UPLOADED PHOTOS ARE", uploadedPhotos);
    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $push: { photos: { $each: uploadedPhotos } } },
      { new: true }, // Returns the pet with the new photos included
    );

    return res.status(200).json({
      message: "Succesfully uploaded photo",
      body: updatedPet,
    });
  } catch (err) {
    console.log("ERROR IN UPLOADING PET PHOTO:", err);
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}
//Not Currently Available for updating photos because we do bulk update
export async function deletePetPhoto(req, res) {
  try {
    const options = {
      new: true,
      runValidators: true,
    };

    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        message: "Not found",
      });
    }
    if (
      pet.ownerId.toString() !== req.user.id.toString() &&
      req.user.role.toString() !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    const newPet = await Pet.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          photos: {
            _id: req.params.photoId,
          },
        },
      },
      options,
    );

    return res.status(200).json({
      message: "Successfully deleted Photo",
      body: newPet,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function updatePhotoCaption(req, res) {
  try {
    const pet = await Pet.findById(req.params.id);
    const options = {
      new: true,
      runValidators: true,
    };
    if (!pet) {
      return res.status(404).json({
        message: "Not Found",
      });
    }
    if (
      req.user.id.toString() !== pet.ownerId.toString() &&
      req.user.role.toString() !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    const updatedPet = await Pet.findOneAndUpdate(
      { _id: req.params.id, "photos._id": req.params.photoId },
      {
        $set: {
          "photos.$.caption": req.body.caption,
        },
      },
      options,
    );

    if (!updatedPet) {
      return res.status(404).json({
        message: "Not Found",
      });
    }
    return res.status(200).json({
      message: "Sucessfully changed Caption",
      body: updatedPet,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}
