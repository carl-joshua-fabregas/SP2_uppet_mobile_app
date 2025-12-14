const Adopter = require("../models/Adopter");
const AdoptionApplication = require("../models/AdoptionApplication");
const ChatThread = require("../models/ChatThread");
const Message = require("../models/Messages");
const Notification = require("../models/Notification");
const Pet = require("../models/Pet");
const Rating = require("../models/Rating");

const createAdopter = async (req, res) => {
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
      age: age,
      occupation: occupation,
      income: income,
      address: address,
      contactInfo: contactInfo,
      livingCon: livingCon,
      lifeStyle: lifeStyle,
      householdMem: householdMem,
      currentOwnedPets: currentOwnedPets,
      hobies: hobies,
      userType: userType,
      googleId: googleId,
      gender: gender,
    });

    const newAdopter = await adopter.save();

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

const findAllUser = async (req, res) => {
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

const findUserByID = async (req, res) => {
  try {
    const user = await Adopter.findById(req.params.id);
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

const findCurrentUser = async (req, res) => {
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

const updateUser = async (req, res) => {
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

const deleteAllUser = async (req, res) => {
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

const deleteUser = async (req, res) => {
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
module.exports = {
  createAdopter,
  findAllUser,
  findUserByID,
  findCurrentUser,
  updateUser,
  deleteAllUser,
  deleteUser,
};
