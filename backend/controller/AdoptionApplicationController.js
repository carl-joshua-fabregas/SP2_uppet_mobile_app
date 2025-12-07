const AdoptionApplication = require("../models/AdoptionApplication");
const Pet = require("../models/Pet");

const createAdoptApp = async (req, res) => {
  try {
    const { petToAdopt, applicant, status, timestamp } = req.body;

    const adoptionApplication = new AdoptionApplication({
      petToAdopt: petToAdopt,
      applicant: applicant,
      status: status,
      timeStamp: timestamp,
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
    if (!allApp) {
      res.status(404).json({
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
      message: "Server Erro",
      body: err.message,
    });
  }
};

//can also be used to all the pets it depends on the frotend
const findMyListAdoptApp = async (req, res) => {
  try {
    const adoptAppList = await AdoptionApplication.find({
      applicant: req.user.id,
    });
    if (!adoptAppList) {
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

    if (!adoptAppListID) {
      return res.status(404).json({
        message: "Nothing Found",
      });
    }

    const petAdoptList = await AdoptionApplication.find({
      petToAdopt: { $in: adoptAppListID },
    }).populate();

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

const updateAdoptionApp = async (req,res) => {
  try {

    const options = {
      new: true,
      runValidators: true
    }

    const adoptionApp = await AdoptionApplication.findById(req.params.id)
    if(!adoptionApp) {
      return res.status(404).json({
        message: "Not found"
      })
    }

    const pet = await Pet.findById(adoptionApp.petToAdopt.id)
    if(!pet) {
      return res.status(404).json({
        message: "Pet not found"
      })
    }
  
    if(pet.ownerId.toString()!==req.user.id.toString() || req.user.role.toString()!=="admin"){
      return res.status(403).json({
        message: "Forbidden"
      })
    }

    const newAdoptionApp = AdoptionApplication.findByIdAndUpdate(req.params.id, { $set: req.body }, options)
    
    return res.status(200).json({
      message: "Successfully updated adoption app",
      body: newAdoptionApp
    })
  }
}

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

module.exports = {};
