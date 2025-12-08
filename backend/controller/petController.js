const Pet = require("../models/Pet");

const createPet = async (req, res) => {
  try {
    const {
      ownerId,
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
      adoptedStatus,
      otherInfo,
      photos,
    } = req.body;

    const newPet = new Pet({
      ownerId: ownerId,
      name: name,
      age: age,
      bio: bio,
      sex: sex,
      species: species,
      breed: breed,
      size: size,
      weight: weight,
      vaccination: vaccination,
      sn: sn,
      healthCond: healthCond,
      behavior: behavior,
      specialNeeds: specialNeeds,
      adoptedStatus: adoptedStatus,
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
};

const findAll = async (req, res) => {
  try {
    const allPets = await Pet.find({});
    if (allPets.length == 0) {
      return res.status(404).json({
        message: "Not found",
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
};

const findByID = async (req, res) => {
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
};

const findByFilter = async (req, res) => {
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
};

const findAllAvailPets = async (req, res) => {
  try {
    const avail = await Pet.find({ adoptedStatus: 1 });

    if (avail.length == 0) {
      return res.status(404).json({
        message: "No pets found",
      });
    }
    return res.status(200).json({
      message: "Successfully found all available pets",
      body: avail,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error Meow",
      body: err.message,
    });
  }
};

const deleteByID = async (req, res) => {
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
};

const deleteAll = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

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
};

const updatePet = async (req, res) => {
  try {
    const options = {
      new: true,
      runValidators: true,
    };

    const userID = req.user.id;

    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        message: "No pet to update found",
      });
    }

    if (
      pet.ownerId.toString() !== userID.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      options
    );

    return res.status(200).json({
      message: "Successfully updated a pet",
      body: pet,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

const uploadPetPhoto = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    const photo = {
      url: req.body.url,
      caption: req.body.caption,
      isProfile: req.body.isProfile,
      timeStamp: Date.now(),
    };

    pet.photos.push(photo);

    const newPhoto = await pet.save();

    return res.status(200).json({
      message: "Succesfully uploaded photo",
      body: newPhoto,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

const deletePetPhoto = async (req, res) => {
  try {
    const options = {
      new: true,
      runValidators: true,
    };
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          photos: {
            _id: req.params.photoId,
          },
        },
      },
      options
    );

    if (!pet) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    return res.status(200).json({
      message: "Successfully deleted Photo",
      body: pet,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  createPet,
  findAll,
  findByID,
  findByFilter,
  findAllAvailPets,
  deleteByID,
  deleteAll,
  updatePet,
  uploadPetPhoto,
  deletePetPhoto,
};
