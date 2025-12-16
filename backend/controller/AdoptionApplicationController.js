const AdoptionApplication = require("../models/AdoptionApplication");
const Pet = require("../models/Pet");

const createAdoptApp = async (req, res) => {
  try {
    const { petToAdopt, applicant } = req.body;

    const adoptionApplication = new AdoptionApplication({
      petToAdopt: petToAdopt,
      applicant: applicant,
    });

    const adoptStat = await adoptionApplication.save();

    return res.status(200).json({
      message: "Successfully created Adoption Application",
      body: adoptStat,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

const findAllAdoptApp = async (req, res) => {
  try {
    if (req.user.role.toString() !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    const allApp = await AdoptionApplication.find({});
    if (allApp.length == 0) {
      return res.status(404).json({
        message: "Nothing Found",
      });
    }
    return res.status(200).json({
      message: "Successfully Obtained all Application",
      body: allApp,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

const findAdoptAppByID = async (req, res) => {
  try {
    const adoptApp = await AdoptionApplication.findById(req.params.id);
    if (!adoptApp) {
      return res.status(404).json({
        message: "Nothing Found",
      });
    }
    return res.status(200).json({
      messsage: "Succesfully found Adoption Application",
      body: adoptApp,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

//can also be used to all the pets it depends on the frontend
const findMyListAdoptApp = async (req, res) => {
  try {
    const adoptAppList = await AdoptionApplication.find({
      applicant: req.user.id,
    });
    if (adoptAppList.length == 0) {
      return res.status(404).json({
        message: "Nothing Found",
      });
    }
    return res.status(200).json({
      message: "Sucessfully obtained your list of adoption applications",
      body: adoptAppList,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

const findMyListAdoptees = async (req, res) => {
  try {
    const adoptAppList = await Pet.find({ ownerId: req.user.id }).select("_id");
    const adoptAppListID = adoptAppList.map((petID) => petID._id);

    if (adoptAppListID.length == 0) {
      return res.status(404).json({
        message: "Nothing Found",
      });
    }

    const petAdoptList = await AdoptionApplication.find({
      petToAdopt: { $in: adoptAppListID },
    })
      .populate("applicant")
      .skip((req.query.page - 1) * 10)
      .limit(10);
    return res.status(200).json({
      message: "Sucessfully obtained your list of adoption applications",
      body: petAdoptList,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};
const findPetApplicants = async (req, res) => {
  try {
    console.log("FINDING PET", req.params.id);
    const adoptAppList = await AdoptionApplication.find({
      petToAdopt: req.params.id,
    })
      .populate("applicant")
      .select("name address");
    if (adoptAppList.length == 0) {
      return res.status(404).json({
        message: "Nothing Found",
      });
    }
    return res.status(200).json({
      message: "Sucessfully obtained your list of adoption applications",
      body: adoptAppList,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};
const updateAdoptionApp = async (req, res) => {
  try {
    const options = {
      new: true,
      runValidators: true,
    };

    const adoptionApp = await AdoptionApplication.findById(req.params.id);
    if (!adoptionApp) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    const pet = await Pet.findById(adoptionApp.petToAdopt);
    if (!pet) {
      return res.status(404).json({
        message: "Pet not found",
      });
    }

    if (
      pet.ownerId.toString() !== req.user.id.toString() &&
      req.user.role.toString() !== "admin" &&
      adoptionApp.applicant.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    if (
      adoptionApp.applicant.toString() === req.user.id.toString() &&
      req.body.status.toString() !== "Cancelled"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const newAdoptionApp = await AdoptionApplication.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      options
    );

    return res.status(200).json({
      message: "Successfully updated adoption app",
      body: newAdoptionApp,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

const deleteAdoptApp = async (req, res) => {
  try {
    if (req.user.role.toString() !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    await AdoptionApplication.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      message: "Deleted Adoption App",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

const deleteAllAdoptApp = async (req, res) => {
  try {
    if (req.user.role.toString() !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    await AdoptionApplication.deleteMany({});

    return res.status(200).json({
      message: "Delete All Adoption App",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

const approveAdoption = async (req, res) => {
  const options = {
    new: true,
    runValidators: true,
  };
  try {
    if (
      req.user.role.toString() !== "user" &&
      req.user.role.toString() !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const acceptedApplication = await AdoptionApplication.findById(
      req.params.id
    );
    if (!acceptedApplication) {
      return res.status(404).json({
        message: "Adoption Application not found",
      });
    }

    const pet = await Pet.findById(acceptedApplication.petToAdopt);
    if (!pet) {
      return res.status(404).json({
        message: "Pet to adopt not found",
      });
    }

    if (pet.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    if (acceptedApplication.status.toString() === "Pending") {
      const accept = await AdoptionApplication.findByIdAndUpdate(
        acceptedApplication.id,
        { status: "Approved" },
        options
      );
      const updatePet = await Pet.findById(
        pet.id,
        { adoptedStatus: "Accepted" },
        options
      );

      const reject = await AdoptionApplication.updateMany(
        {
          petToAdopt: pet.id,
          _id: { $ne: req.params.id },
          status: { $ne: "Approved", $ne: "Rejected", $ne: "Cancelled" },
        },
        { status: "Rejected" },
        options
      );
      return res.status(200).json({
        message: "Approved",
        body: accept,
      });
    } else {
      return res.status(400).json({
        message: "Application Already Approved",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

const rejectApplicant = async (req, res) => {
  const options = {
    new: true,
    runValidators: true,
  };
  try {
    const application = await AdoptionApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const pet = await Pet.findById(application.petToAdopt);

    if (!pet) {
      return res.status(404).json({
        message: "Pet not found",
      });
    }

    if (
      pet.ownerId.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const rejectApplication = await AdoptionApplication.findByIdAndUpdate(
      application.id,
      {
        status: "Rejected",
      },
      options
    );

    return res.status(200).json({
      message: "Application Rejected",
      body: application,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};
module.exports = {
  createAdoptApp,
  findAllAdoptApp,
  findAdoptAppByID,
  findMyListAdoptApp,
  findMyListAdoptees,
  findPetApplicants,
  updateAdoptionApp,
  deleteAdoptApp,
  deleteAllAdoptApp,
  approveAdoption,
  rejectApplicant,
};
