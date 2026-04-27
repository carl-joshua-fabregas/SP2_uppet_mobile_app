import Adopter from "../models/Adopter.js";
import AdoptionApplication from "../models/AdoptionApplication.js";
import ChatThread from "../models/ChatThread.js";
import Message from "../models/Messages.js";
import Notification from "../models/Notification.js";
import Pet from "../models/Pet.js";
import Rating from "../models/Rating.js";
import jwt from "jsonwebtoken";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function createAdopter(req, res) {
  console.log("Create Adopter Called");
  console.log("Req Body is", req.body);
  try {
    const {
      firstName,
      middleName,
      lastName,
      bio,
      age,
      occupation,
      income,
      address,
      contactInfo,
      livingCon,
      lifeStyle,
      householdMem,
      currentOwnedPets,
      hobbies,
      userType,
      googleId,
      gender,
      hadPets,
      profilePhoto,
    } = req.body;
    const adopter = new Adopter({
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      bio: bio,
      age: parseInt(age),
      occupation: occupation,
      income: parseInt(income),
      address: address,
      contactInfo: contactInfo,
      livingCon: livingCon,
      lifeStyle: lifeStyle,
      householdMem: parseInt(householdMem),
      currentOwnedPets: parseInt(currentOwnedPets),
      hobbies: hobbies,
      userType: userType,
      googleId: googleId,
      gender: gender,
      hadPets: hadPets,
      profilePhoto: profilePhoto,
    });

    const newAdopter = await adopter.save();
    console.log("ADOPTER GOT SAVED", newAdopter);

    const jwttoken = jwt.sign(
      {
        id: newAdopter._id,
        role: newAdopter.userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "14d" },
    );
    //New Adopter Notification
    const notifcations = new Notification({
      recepient: newAdopter._id,
      sender: newAdopter._id,
      relatedEntity: newAdopter._id,
      entityModel: "Adopter",
      message: "Successfully created new adopter profile",
      notifType: "ADOPTER_NEW",
    });
    const saveNotif = await notifcations.save();
    console.log("Notification Saved", saveNotif);
    const io = req.app.get("io");

    //Console log tell notifications of the user
    io.to(newAdopter._id.toString()).emit("new_notification", saveNotif);

    return res.status(200).json({
      message: "Successfully added user",
      body: newAdopter,
      token: jwttoken,
    });
  } catch (err) {
    console.log("===========Creation Error===========");
    console.error(err);
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function findAllUser(req, res) {
  try {
    if (req.user.role.toString() !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const user = await Adopter.find({});
    if (user.length == 0) {
      return res.status(200).json({
        message: "Adopters not found",
        body: [],
      });
    }
    return res.status(200).json({
      message: "Successfully found all user",
      body: user,
    });
  } catch (err) {
    console.log("-----FIND ALL USER ERROR----------");
    console.error(err);
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function findUserByID(req, res) {
  try {
    const user = await Adopter.findById(req.params.id);
    console.log("FIND BY USER ID");
    console.log(user);
    if (!user) {
      return res.status(200).json({
        message: "Not found",
        body: [],
      });
    }

    return res.status(200).json({
      message: "Successfully found User",
      body: user,
    });
  } catch (err) {
    console.log("---------FIND USER BY ID ERROR----------");
    console.error(err);
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function findCurrentUser(req, res) {
  try {
    const user = await Adopter.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "Not found",
        body: [],
      });
    }
    return res.status(200).json({
      message: "User Found",
      body: user,
    });
  } catch (err) {
    console.log("===========FIND CURRENT USER ERROR==========");
    console.error(err);

    return res.status(500).json({
      message: "Server Errorr",
      body: err.message,
    });
  }
}

export async function updateUser(req, res) {
  console.log("---------------------UPDATING----------------");
  try {
    const options = {
      new: true,
      runValidators: true,
    };

    const user = await Adopter.findById(req.user.id);
    if (!user) {
      return res.status(200).json({
        message: "Not Found",
        body: [],
      });
    }

    const newUser = await Adopter.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      options,
    );

    const notifcations = new Notification({
      recepient: newUser._id,
      sender: newUser._id,
      relatedEntity: newUser._id,
      entityModel: "Adopter",
      message: "Successfully updated adopter profile",
      notifType: "ADOPTER_UPDATED",
    });

    const saveNotif = await notifcations.save();
    console.log("Notification Saved", saveNotif);
    const io = req.app.get("io");

    io.to(newUser._id.toString()).emit("new_notification", saveNotif);

    return res.status(200).json({
      message: "Successfully updated",
      body: newUser,
    });
  } catch (err) {
    console.log("==========ERROR IN UPDATING=========");
    console.error(err);
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

//Adming Privilege
export async function deleteAllUser(req, res) {
  try {
    if (req.user.role.toString() !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    await Adopter.deleteMany({});
    return res.status(200).json({
      message: "Successfully deleted all user",
    });
  } catch (err) {
    console.log("-----------DELETE ALL USER ERROR--------------");
    console.error(err);
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function deleteUser(req, res) {
  try {
    const user = await Adopter.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    if (
      req.user.id.toString() !== user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    await AdoptionApplication.deleteMany({ applicant: req.params.id });
    await Notification.deleteMany({ notifRecipient: req.params.id });
    await Pet.deleteMany({ ownerId: req.params.id });
    await Message.deleteMany({ sender: req.params.id });
    await ChatThread.deleteMany({ members: req.params.id });
    await Rating.deleteMany({ reviewer: req.params.id });
    await Rating.deleteMany({ ratedUser: req.params.id });

    await Adopter.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Successfully deleted user",
    });
  } catch (err) {
    console.log("---------------DELETE ACOUNT ERROR-------------");
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}
export async function uploadAdopterPhoto(req, res) {
  console.log("UPLOAD Adopter PHOTO CONTROLLER CALLED");
  try {
    console.log("Adoper ID IN UPLOAD PET PHOTO CONTROLLER", req.user.id);

    const adopter = await Adopter.findById(req.user.id);
    if (!adopter) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    // const uploadedPhotos = req.body.photos.map((p) => ({
    //   url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${p.key}`,
    //   key: p.key,
    //   caption: p.caption,
    //   isProfile: p.isProfile,
    //   timeStamp: p.timeStamp,
    // }));

    const uploadedPhoto = {
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${req.body.key}`,
      key: req.body.key,
      timeStamp: req.body.timeStamp,
    };

    console.log("BACKED END HERE UPLOADED PHOTOS ARE", uploadedPhoto);
    const updatedAdopter = await Adopter.findByIdAndUpdate(
      req.user.id,
      { $set: { profilePhoto: uploadedPhoto } },
      { new: true }, // Returns the pet with the new photos included
    );

    return res.status(200).json({
      message: "Succesfully uploaded photo",
      body: updatedAdopter,
    });
  } catch (err) {
    console.log("ERROR IN UPLOADING PET PHOTO:", err);
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function presignUploadURL(req, res) {
  console.log("IN THE UPLOAD PRESIGN URL");
  try {
    const key = `user/${req.user.id}/${req.body.fileSize}_${req.body.fileName}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: req.body.fileType,
      // Metadata:{
      //   uri: req.body.uri || "",
      //   name: req.body.name || ""
      // }
    });
    // console.log(
    //   process.env.AWS_BUCKET_NAME,
    //   process.env.AWS_REGION,
    //   process.env.AWS_ACCESS_KEY_ID,
    //   process.env.AWS_SECRET_ACCESS_KEY,
    // );
    // console.log("GENERATING PRESIGNED URL FOR KEY:", key);
    // console.log("WITH COMMAND:", command);

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    // console.log("PRESIGNED URL GENERATED:", url);
    const finalUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
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
    console.log("GENERATING presignDeleteURL", req.body);
    const key = req.body.key;
    console.log("THIS IS THE KEY", key);
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
