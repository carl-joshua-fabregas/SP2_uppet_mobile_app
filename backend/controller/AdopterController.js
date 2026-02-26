import Adopter from "../models/Adopter.js";
import AdoptionApplication from "../models/AdoptionApplication.js";
import ChatThread from "../models/ChatThread.js";
import Message from "../models/Messages.js";
import Notification from "../models/Notification.js";
import Pet from "../models/Pet.js";
import Rating from "../models/Rating.js";

export async function createAdopter (req, res) {
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
      hobies,
      userType,
      googleId,
      gender,
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
      hobies: hobies,
      userType: userType,
      googleId: googleId,
      gender: gender,
    });

    const newAdopter = await adopter.save();
    console.log("ADOPTER GOT SAVED", newAdopter);
    return res.status(200).json({
      message: "Successfully added user",
      body: newAdopter,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function findAllUser (req, res) {
  try {
    if (req.user.role.toString() !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const user = await Adopter.find({});
    if (user.length == 0) {
      return res.status(404).json({
        message: "Not Found",
      });
    }
    return res.status(200).json({
      message: "Successfully found all user",
      body: user,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function findUserByID (req, res) {
  try {
    const user = await Adopter.findById(req.params.id);
    console.log("FIND BY USER ID");
    console.log(user);
    if (!user) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    return res.status(200).json({
      message: "Successfully found User",
      body: user,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function findCurrentUser (req, res) {
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
    return res.status(500).json({
      message: "Server Errorr",
      body: err.message,
    });
  }
};

export async function updateUser (req, res) {
  try {
    const options = {
      new: true,
      runValidators: true,
    };

    const user = await Adopter.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    if (
      req.user.id.toString() !== user._id.toString() &&
      req.user.role.toString() !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const newUser = await Adopter.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      options
    );

    return res.status(200).json({
      message: "Successfully updated",
      body: newUser,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function deleteAllUser (req, res) {
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
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function deleteUser (req, res) {
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
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

