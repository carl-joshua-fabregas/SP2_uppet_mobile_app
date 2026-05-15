import AdoptionApplication from "../models/AdoptionApplication.js";
import Notification from "../models/Notification.js";
import Pet from "../models/Pet.js";
import Match from "../models/Match.js";
export async function createAdoptApp(req, res) {
  try {
    const { petToAdopt } = req.body;

    const oldAdopApp = await AdoptionApplication.findOne({
      applicant: req.user.id,
      petToAdopt: petToAdopt,
    });

    if (oldAdopApp)
      return res.status(409).json({
        message: "Cannot Create since application already exists",
      });

    const pet = await Pet.findById(petToAdopt);
    if (!pet)
      return res.status(404).json({
        message: "PET NOT FOUND",
      });

    if (pet.ownerId.toString() === req.user.id.toString()) {
      return res.status(409).json({
        message: "Owner Cannot Apply for their Pet",
      });
    }

    const adoptionApplication = new AdoptionApplication({
      petToAdopt: petToAdopt,
      applicant: req.user.id,
    });

    const adoptStat = await adoptionApplication.save();
    const io = req.app.get("io");

    const newOwnerNotification = new Notification({
      recipient: pet.ownerId,
      sender: req.user.id,
      notifType: "ADOP_APP_RECEIVED",
      entityModel: "AdoptionApplication",
      relatedEntity: adoptStat._id,
      message: "Someone Applied for a pet",
    });

    const newApplicantNotification = new Notification({
      recipient: req.user.id,
      sender: pet.ownerId,
      notifType: "ADOP_APP_RECEIVED",
      entityModel: "AdoptionApplication",
      relatedEntity: adoptStat._id,
      message: "Successfully Applied for a pet",
    });

    const newOwnNotifRes = await newOwnerNotification.save();
    const newAplNotifRes = await newApplicantNotification.save();

    io.to(pet.ownerId.toString()).emit("adoptionApp_created", {
      message: "adoption app was created",
      adoptionApp: adoptStat,
    });

    io.to(pet.ownerId.toString()).emit("notification_created", {
      message: "Notification created for applying",
      notification: newOwnNotifRes,
    });

    io.to(req.user.id.toString()).emit("adoptionApp_created", {
      message: "adoption app was created",
      adoptionApp: adoptStat,
    });

    io.to(req.user.id.toString()).emit("notification_created", {
      message: "Notification created for applying",
      notification: newAplNotifRes,
    });

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
}

export async function findAllAdoptApp(req, res) {
  try {
    if (req.user.role.toString() !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    const allApp = await AdoptionApplication.find({});
    if (allApp.length == 0) {
      return res.status(200).json({
        message: "No Applications Found",
        body: [],
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
}

export async function findAdoptAppByID(req, res) {
  try {
    const adoptApp = await AdoptionApplication.findById(req.params.id)
      .populate("applicant")
      .populate("petToAdopt");
    if (!adoptApp) {
      return res.status(404).json({
        message: "No Applications Found",
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
}

//can also be used to all the pets it depends on the frontend
export async function findMyListAdoptApp(req, res) {
  try {
    const adoptAppList = await AdoptionApplication.find({
      applicant: req.user.id,
    });
    if (adoptAppList.length == 0) {
      return res.status(200).json({
        message: "No Applications found",
        body: [],
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
}

export async function findMyListAdoptees(req, res) {
  try {
    const adoptAppList = await Pet.find({ ownerId: req.user.id }).select("_id");
    const adoptAppListID = adoptAppList.map((petID) => petID._id);

    if (adoptAppListID.length == 0) {
      return res.status(200).json({
        message: "No Applications Found",
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
}

export async function findMyPetPendingApplications(req, res) {
  try {
    const { limit, lastId, lastAppUpdate } = req.query;
    let paginationQuery = {};
    if (lastId && lastAppUpdate) {
      paginationQuery = {
        $or: [
          { updatedAt: { $lt: lastAppUpdate } },
          { updatedAt: lastAppUpdate, _id: { $lt: lastId } },
        ],
      };
    }
    const adoptAppList = await AdoptionApplication.find({
      applicant: req.user.id,
      status: "Pending",
      ...paginationQuery,
    })
      .populate("petToAdopt")
      .limit(limit ? parseInt(limit) : 10)
      .sort({ updatedAt: -1, _id: -1 });

    if (adoptAppList.length == 0) {
      return res.status(200).json({
        message: "No Applicants found",
        body: [],
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
}
export async function findMyPetApprovedApplications(req, res) {
  try {
    const { limit, lastId, lastAppUpdate } = req.query;
    let paginationQuery = {};
    if (lastId && lastAppUpdate) {
      paginationQuery = {
        $or: [
          { updatedAt: { $lt: lastAppUpdate } },
          { updatedAt: lastAppUpdate, _id: { $lt: lastId } },
        ],
      };
    }
    const adoptAppList = await AdoptionApplication.find({
      applicant: req.user.id,
      status: "Approved",
      ...paginationQuery,
    })
      .populate("petToAdopt")
      .limit(limit ? parseInt(limit) : 10)
      .sort({ updatedAt: -1, _id: -1 });

    if (adoptAppList.length == 0) {
      return res.status(200).json({
        message: "No Applicants found",
        body: [],
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
}

export async function findMyPetRejectedApplications(req, res) {
  try {
    const { limit, lastId, lastAppUpdate } = req.query;
    let paginationQuery = {};
    if (lastId && lastAppUpdate) {
      paginationQuery = {
        $or: [
          { updatedAt: { $lt: lastAppUpdate } },
          { updatedAt: lastAppUpdate, _id: { $lt: lastId } },
        ],
      };
    }
    const adoptAppList = await AdoptionApplication.find({
      applicant: req.user.id,
      status: "Rejected",
      ...paginationQuery,
    })
      .populate("petToAdopt")
      .limit(limit ? parseInt(limit) : 10)
      .sort({ updatedAt: -1, _id: -1 });

    if (adoptAppList.length == 0) {
      return res.status(200).json({
        message: "No Applicants found",
        body: [],
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
}

export async function findPetPendingApplicants(req, res) {
  try {
    const { limit, lastId, lastAppUpdate } = req.query;
    let paginationQuery = {};
    if (lastId && lastAppUpdate) {
      paginationQuery = {
        $or: [
          { updatedAt: { $lt: lastAppUpdate } },
          { updatedAt: lastAppUpdate, _id: { $lt: lastId } },
        ],
      };
    }
    const adoptAppList = await AdoptionApplication.find({
      petToAdopt: req.params.id,
      status: "Pending",
      ...paginationQuery,
    })
      .populate(
        "applicant",
        "firstName middleName lastName address profilePhoto",
      )
      .limit(limit ? parseInt(limit) : 10)
      .sort({ updatedAt: -1, _id: -1 });

    if (adoptAppList.length == 0) {
      return res.status(200).json({
        message: "No Applicants found",
        body: [],
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
}
export async function findPetApprovedApplicants(req, res) {
  try {
    const { limit, lastId, lastAppUpdate } = req.query;
    let paginationQuery = {};
    if (lastId && lastAppUpdate) {
      paginationQuery = {
        $or: [
          { updatedAt: { $lt: lastAppUpdate } },
          { updatedAt: lastAppUpdate, _id: { $lt: lastId } },
        ],
      };
    }
    const adoptAppList = await AdoptionApplication.find({
      petToAdopt: req.params.id,
      status: "Approved",
      ...paginationQuery,
    })
      .populate(
        "applicant",
        "firstName middleName lastName address profilePhoto",
      )
      .limit(limit ? parseInt(limit) : 10)
      .sort({ updatedAt: -1, _id: -1 });

    if (adoptAppList.length == 0) {
      return res.status(200).json({
        message: "No Applicants found",
        body: [],
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
}
export async function findPetRejectedApplicants(req, res) {
  try {
    const { limit, lastId, lastAppUpdate } = req.query;
    let paginationQuery = {};
    if (lastId && lastAppUpdate) {
      paginationQuery = {
        $or: [
          { updatedAt: { $lt: lastAppUpdate } },
          { updatedAt: lastAppUpdate, _id: { $lt: lastId } },
        ],
      };
    }
    const adoptAppList = await AdoptionApplication.find({
      petToAdopt: req.params.id,
      status: "Rejected",
      ...paginationQuery,
    })
      .populate(
        "applicant",
        "firstName middleName lastName address profilePhoto",
      )
      .limit(limit ? parseInt(limit) : 10)
      .sort({ updatedAt: -1, _id: -1 });

    if (adoptAppList.length == 0) {
      return res.status(200).json({
        message: "No Applicants found",
        body: [],
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
}
export async function findPetUserApplication(req, res) {
  try {
    console.log("FINDING PET USER ID APPLICATION");
    const app = await AdoptionApplication.findOne({
      applicant: req.user.id,
      petToAdopt: req.params.id,
    });
    // const pet = await Pet.findById(req.params.id);
    // console.log("FINDING PET USER ID APPLICATION END");

    // const isOwner =
    //   pet.ownerId.toString() === req.user.id.toString() ? true : false;
    // const status = app ? app.status : false;

    return res.status(200).json({
      message: "Successful adoption app inquiry",
      body: app,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function reapplyUpdateAdoptionApp(req, res) {
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
    if (adoptionApp.applicant.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    if (pet.adoptedStatus) {
      return res.status(409).json({
        message: "Collission with data in reapply",
      });
    }
    if (adoptionApp.status === "Approved") {
      return res.status(409).json({
        message: "Collission with data, it is approved",
      });
    }
    const newAdoptionApp = await AdoptionApplication.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "Pending" } },
      options,
    )
      .populate("applicant")
      .populate("petToAdopt");

    const io = req.app.get("io");

    const newOwnerNotification = new Notification({
      recipient: pet.ownerId,
      sender: req.user.id,
      notifType: "ADOP_APP_RECEIVED",
      entityModel: "AdoptionApplication",
      relatedEntity: newAdoptionApp._id,
      message: "Successfully Applied for a pet",
    });

    const newApplicantNotification = new Notification({
      recipient: req.user.id,
      sender: pet.ownerId,
      notifType: "ADOP_APP_RECEIVED",
      entityModel: "AdoptionApplication",
      relatedEntity: newAdoptionApp._id,
      message: "Successfully Applied for a pet",
    });

    const newOwnNotifRes = await newOwnerNotification.save();
    const newAplNotifRes = await newApplicantNotification.save();

    io.to(pet.ownerId.toString()).emit("adoptionApp_updated", {
      // <-- Changed to updated
      message: "adoption app was updated",
      adoptionApp: newAdoptionApp,
    });

    io.to(pet.ownerId.toString()).emit("notification_created", {
      message: "Notification created for applying",
      notification: newOwnNotifRes,
    });

    io.to(req.user.id.toString()).emit("adoptionApp_updated", {
      // <-- Changed to updated
      message: "adoption app was updated",
      adoptionApp: newAdoptionApp,
    });

    io.to(req.user.id.toString()).emit("notification_created", {
      message: "Notification created for applying",
      notification: newAplNotifRes,
    });
    return res.status(200).json({
      message: "Success in reapplying",
      body: newAdoptionApp,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}
export async function updateAdoptionApp(req, res) {
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
      options,
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
}

export async function cancelAdoptApp(req, res) {
  try {
    const options = {
      new: true,
      runValidators: true,
    };
    console.log("This is the cancel adoptApp, wite", req.params.id);
    const app = await AdoptionApplication.findById(req.params.id);
    console.log("This is the app", app);
    if (!app) {
      return res.status(404).json({
        message: "Adoption Application Does not exists",
      });
    }
    console.log("App exists");
    if (!(app.status === "Pending")) {
      return res.status(409).json({
        message: "Conflict in server, Cannot cancel not pending value",
      });
    }
    const pet = await Pet.findById(app.petToAdopt);

    if (!pet)
      return res.status(404).json({
        message: "Pet does not exist",
      });

    if (pet.adoptedStatus) {
      return res.status(409).json({
        message:
          "Pet status conflict, cannot cancel pet that is already adoptedd",
      });
    }

    const cancelledApp = await AdoptionApplication.findByIdAndUpdate(
      req.params.id,
      {
        $set: { status: "Cancelled" },
      },
      options,
    )
      .populate("applicant")
      .populate("petToAdopt");
    const io = req.app.get("io");

    const newOwnerNotification = new Notification({
      recipient: pet.ownerId,
      sender: req.user.id,
      notifType: "ADOP_APP_CANCELLED",
      entityModel: "AdoptionApplication",
      relatedEntity: cancelledApp._id,
      message: "Successfully Cancelled Application for a pet",
    });

    const newApplicantNotification = new Notification({
      recipient: req.user.id,
      sender: pet.ownerId,
      notifType: "ADOP_APP_CANCELLED",
      entityModel: "AdoptionApplication",
      relatedEntity: cancelledApp._id,
      message: "Successfully Cancelled Application for a pet",
    });

    const newOwnNotifRes = await newOwnerNotification.save();
    const newAplNotifRes = await newApplicantNotification.save();

    io.to(pet.ownerId.toString()).emit("adoptionApp_cancelled", {
      message: "adoption app was created",
      adoptionApp: cancelledApp,
    });

    io.to(pet.ownerId.toString()).emit("notification_created", {
      message: "Notification created for applying",
      notification: newOwnNotifRes,
    });

    io.to(req.user.id.toString()).emit("adoptionApp_cancelled", {
      message: "adoption app was created",
      adoptionApp: cancelledApp,
    });

    io.to(req.user.id.toString()).emit("notification_created", {
      message: "Notification created for cancelling",
      notification: newAplNotifRes,
    });

    return res.status(200).json({
      message: "Cancelled Adoption App",
      body: cancelledApp,
    });
  } catch (err) {
    console.log("Cancel Error in adoption App", err.message);
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function deleteAllAdoptApp(req, res) {
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
}

export async function approveAdoption(req, res) {
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
      req.params.id,
    );
    if (!acceptedApplication) {
      return res.status(404).json({
        message: "Adoption Application not found",
      });
    }

    if (
      acceptedApplication.status.toString() === "Approved" ||
      acceptedApplication.status.toString() === "Cancelled" ||
      acceptedApplication.status.toString() === "Rejected"
    ) {
      return res.status(409).json({
        message: `Application Already ${acceptedApplication.status.toString()}`,
      });
    }

    const pet = await Pet.findById(acceptedApplication.petToAdopt);
    if (!pet) {
      return res.status(404).json({
        message: "Pet to adopt not found",
      });
    }
    if (pet.adoptedStatus === true) {
      return res.status(409).json({
        message: "Pet already adopted",
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
        options,
      )
        .populate("applicant")
        .populate("petToAdopt");
      const io = req.app.get("io");

      const newAcceptAplNotification = new Notification({
        recipient: accept.applicant._id,
        sender: req.user.id,
        notifType: "ADOP_APP_APPROVED",
        entityModel: "AdoptionApplication",
        relatedEntity: accept._id,
        message: "Adoption App has been successful",
      });

      const newAcceptOwnNotification = new Notification({
        recipient: req.user.id,
        sender: accept.applicant._id,
        notifType: "ADOP_APP_APPROVED",
        entityModel: "AdoptionApplication",
        relatedEntity: accept._id,
        message: "Adoption App has been successful",
      });
      const newAccAplNotRes = await newAcceptAplNotification.save();
      const newAccOwnNotRes = await newAcceptOwnNotification.save();
      // Winner winner chicken dinner (Approved Adoption Emitter)
      io.to(accept.applicant._id.toString()).emit("adoptionApp_approved", {
        message: "Adoption App emittion, it has been accepted",
        adoptionApp: accept,
      });

      io.to(accept.applicant._id.toString()).emit("notification_created", {
        message: "Notification created for applying",
        notification: newAccAplNotRes,
      });

      io.to(pet.ownerId.toString()).emit("adoptionApp_approved", {
        message: "Adoption App emittion, it has been accepted",
        adoptionApp: accept,
      });

      io.to(pet.ownerId.toString()).emit("notification_created", {
        message: "Notification created for applying",
        notification: newAccOwnNotRes,
      });

      const updatePet = await Pet.findByIdAndUpdate(
        pet.id,
        { adoptedStatus: true },
        options,
      );

      const reject = await AdoptionApplication.updateMany(
        {
          petToAdopt: pet.id,
          _id: { $ne: req.params.id },
          status: { $eq: "Pending" },
        },
        { status: "Rejected" },
      );

      const rejectedList = await AdoptionApplication.find({
        petToAdopt: pet._id,
        _id: { $ne: req.params.id },
        status: { $eq: "Rejected" },
      });

      const rejectOthers = await Promise.all(
        rejectedList.map(async (adopApp) => {
          await adopApp.populate("applicant");
          await adopApp.populate("petToAdopt");
          const rejectNotif = new Notification({
            recipient: adopApp.applicant._id,
            sender: req.user.id,
            relatedEntity: adopApp._id,
            entityModel: "AdoptionApplication",
            message: "Application Rejected",
            notifType: "ADOP_APP_REJECTED",
          });
          const rejectNotifRes = await rejectNotif.save();

          io.to(adopApp.applicant._id.toString()).emit("adoptionApp_rejected", {
            message: "Adoption App Rejected",
            adoptionApp: adopApp,
          });
          io.to(adopApp.applicant._id.toString()).emit("notification_created", {
            message: "Notification created for approving",
            notification: rejectNotifRes,
          });

          io.to(pet.ownerId.toString()).emit("adoptionApp_rejected", {
            message: "Adoption App of adopter is Rejected",
            adoptionApp: adopApp,
          });
        }),
      );

      const updatedList = await AdoptionApplication.find({
        petToAdopt: acceptedApplication.petToAdopt,
      }).populate("applicant");

      if (updatedList.length === 0) {
        return res.status(500).json({
          message: "Error Retrieving Updated List",
        });
      }

      await Match.deleteMany({ petID: accept.petToAdopt._id });
      return res.status(200).json({
        message: "Approved",
        body: updatedList,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function rejectApplicant(req, res) {
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
    if (
      application.status.toString() === "Approved" ||
      application.status.toString() === "Cancelled" ||
      application.status.toString() === "Rejected"
    ) {
      return res.status(409).json({
        message: "Application Already Processed",
      });
    }

    const pet = await Pet.findById(application.petToAdopt);

    if (!pet) {
      return res.status(404).json({
        message: "Pet not found",
      });
    }
    if (pet.adoptedStatus === true) {
      return res.status(409).json({
        message: "Pet already adopted",
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
      options,
    )
      .populate("applicant")
      .populate("petToAdopt");

    const rejectNotif = new Notification({
      recipient: rejectApplication.applicant._id,
      sender: req.user.id,
      relatedEntity: rejectApplication._id,
      entityModel: "AdoptionApplication",
      message: "Application Rejected",
      notifType: "ADOP_APP_REJECTED",
    });
    const rejectNotifRes = await rejectNotif.save();

    const io = req.app.get("io");

    io.to(rejectApplication.applicant._id.toString()).emit(
      "adoptionApp_rejected",
      {
        message: "Adoption App emittion, it has been accepted",
        adoptionApp: rejectApplication,
      },
    );

    io.to(rejectApplication.applicant._id.toString()).emit(
      "notification_created",
      {
        message: "Notification created for applying",
        notification: rejectNotifRes,
      },
    );

    io.to(pet.ownerId.toString()).emit("adoptionApp_rejected", {
      message: "Adoption App emittion, it has been accepted",
      adoptionApp: rejectApplication,
    });

    const updatedList = await AdoptionApplication.find({
      petToAdopt: rejectApplication.petToAdopt,
    }).populate("applicant");

    if (updatedList.length === 0) {
      return res.status(500).json({
        message: "Error Retrieving Updated List",
      });
    }

    return res.status(200).json({
      message: "Application Rejected",
      body: updatedList,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}
