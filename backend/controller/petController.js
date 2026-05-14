import Pet from "../models/Pet.js";
import AdoptionApplication from "../models/AdoptionApplication.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mongoose from "mongoose";
import Adopter from "../models/Adopter.js";
import Match from "../models/Match.js";
import { generateBulkMatchForPet } from "../services/matchingServices.js";
import s3 from "../config/aws.js";

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

    const status = await newPet.save();
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
      const avail = await Pet.find({ adoptedStatus: { $ne: true } })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate("ownerId", "firstName middleName lastName");
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
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .populate("ownerId", "firstName middleName lastName");

    if (avail.length === 0) {
      return res.status(200).json({
        message: "AVAILABLE PETS ARE EMPTY",
        body: [],
      });
    }
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

export async function findMyPetsAvailable(req, res) {
  try {
    const { limit, lastPetID, lastPetUpdate } = req.query;
    let paginationQuery = {};
    if (lastPetID && lastPetUpdate) {
      paginationQuery = {
        $or: [
          { updatedAt: { $lt: lastPetUpdate } },
          { updatedAt: lastPetUpdate, _id: { $lt: lastPetID } },
        ],
      };
    }
    const aggregatePets = await Pet.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(req.user.id),
          adoptedStatus: { $ne: true },
          ...paginationQuery,
        },
      },
      { $sort: { updatedAt: -1, _id: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "adopters",
          localField: "ownerId",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $unwind: {
          path: "$ownerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          ownerId: {
            _id: "$ownerDetails._id",
            firstName: "$ownerDetails.firstName",
            middleName: "$ownerDetails.middleName",
            lastName: "$ownerDetails.lastName",
            profilePhoto: "$ownerDetails.profilePhoto",
          },
        },
      },
      { $project: { ownerDetails: 0 } },
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
export async function findMyPetsAdopted(req, res) {
  try {
    const { limit, lastPetID, lastPetUpdate } = req.query;
    let paginationQuery = {};
    if (lastPetID && lastPetUpdate) {
      paginationQuery = {
        $or: [
          { updatedAt: { $lt: lastPetUpdate } },
          { updatedAt: lastPetUpdate, _id: { $lt: lastPetID } },
        ],
      };
    }
    const aggregatePets = await Pet.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(req.user.id),
          adoptedStatus: { $eq: true },
          ...paginationQuery,
        },
      },
      { $sort: { updatedAt: -1, _id: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "adopters",
          localField: "ownerId",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $unwind: {
          path: "$ownerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          ownerId: {
            _id: "$ownerDetails._id",
            firstName: "$ownerDetails.firstName",
            middleName: "$ownerDetails.middleName",
            lastName: "$ownerDetails.lastName",
            profilePhoto: "$ownerDetails.profilePhoto",
          },
        },
      },
      { $project: { ownerDetails: 0 } },
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
    const io = req.app.get("io");
    io.emit("pet_deleted", {
      message: "Pet deletion was successful",
      pet: req.params.id,
    });

    await Match.deleteMany({ petID: pet._id });

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
    const { initialCreation = false, ...updateData } = req.body;
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
      { $set: updateData },
      options,
    ).populate("ownerId", "firstName middleName lastName");

    const io = req.app.get("io");
    if (initialCreation) {
      io.emit("pet_created", {
        message: "Message has been created",
        pet: updatedPet,
      });
    } else {
      io.emit("pet_updated", {
        message: "Pet has been updated",
        pet: updatedPet,
      });
    }
    res.status(200).json({
      message: "Successfully updated a pet",
      body: updatedPet,
    });

    generateBulkMatchForPet(updatedPet).catch((err) =>
      console.log("Background match failed:", err),
    );
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

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const finalUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    return res.status(200).json({
      message: "Successfully obtained presigned URL",
      body: { url: url, key: key, finalUrl: finalUrl },
    });
  } catch (err) {
    return res.status(505).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function presignDeleteURL(req, res) {
  try {
    const key = req.body.key;
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

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
  try {
    const pet = await Pet.findById(req.params.id).populate(
      "ownerId",
      "firstName middleName lastName",
    );
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
