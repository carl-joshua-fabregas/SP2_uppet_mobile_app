import Rating from "../models/Rating.js";

export async function createRating(req, res) {
  try {
    const { ratedUser, score, body } = req.body;
    const existingReview = await Rating.find({
      ratedUser: ratedUser,
      reviewer: req.user.id,
    });
    if (existingReview.length > 0) {
      return res.status(200).json({
        message: "You have already rated this user",
        body: [],
      });
    }
    const rating = new Rating({
      ratedUser: ratedUser,
      score: score,
      reviewer: req.user.id,
      body: body,
    });

    const newRating = await rating.save();
    const io = req.app.get("io");
    io.emit(`newRating-${ratedUser}`, newRating);
    return res.status(200).json({
      message: "Successfully made Rating",
      body: newRating,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function findAllRating(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    const notification = await Rating.find({});
    if (notification.length == 0) {
      return res.status(404).json({
        message: "Nothing Found",
      });
    }
    return res.status(200).json({
      message: "Successfully found all ratins",
      body: notification,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function findRatingByUserToUser(req, res) {
  try {
    const { ratedID } = req.params;
    const rating = await Rating.findOne({
      ratedUser: ratedID,
      reviewer: req.user.id,
    });
    if (!rating) {
      return res.status(200).json({
        message: "Rating does not exist",
        body: [],
      });
    }
    return res.status(200).json({
      message: "Rating Found",
      body: rating,
    });
  } catch (err) {
    console.log("Error in finding the user rating");
    return res.status(500).json({
      message: "Server Error",
      body: err,
    });
  }
}
// Does not include user made ratings because we will do 2 queries
export async function findRatingsOfUser(req, res) {
  try {
    const limit = Number(req.query.limit) || 10;
    const lastRatingID = req.query.lastRatingID;
    const ratedID = req.params.ratedID;

    if (!lastRatingID) {
      const rating = await Rating.find({
        ratedUser: ratedID,
        reviewer: { $ne: req.user.id },
      })
        .sort({ updatedAt: -1, _id: -1 })
        .limit(limit);

      if (rating.length == 0) {
        return res.status(200).json({
          message: "Nothing Found",
          body: [],
        });
      }
      return res.status(200).json({
        message: "Successfully found all ratings",
        body: rating,
      });
    }

    const cursorRating = await Rating.findById(lastRatingID);
    if (!cursorRating) {
      return res.status(200).json({
        message: "No cursor rating found",
        body: [],
      });
    }

    const rating = await Rating.find({
      ratedUser: ratedID,
      reviewer: { $ne: req.user.id },
      $or: [
        { updatedAt: { $lt: cursorRating.updatedAt } },
        {
          updatedAt: cursorRating.updatedAt,
          _id: { $lt: cursorRating._id },
        },
      ],
    })
      .sort({ updatedAt: -1, _id: -1 })
      .limit(limit);

    if (rating.length == 0) {
      return res.status(200).json({
        message: "Nothing Found",
        body: [],
      });
    }
    return res.status(200).json({
      message: "Successfully found all ratings",
      body: rating,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function findAllRatedUser(req, res) {
  try {
    const ratedUser = await Rating.find({ reviewer: req.user.id });

    if (ratedUser.length === 0) {
      return res.status(404).json({
        message: "No ratings found",
      });
    }

    return res.status(200).json({
      message: "Successfully found all given ratings",
      body: ratedUser,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function updateRating(req, res) {
  try {
    const options = {
      new: true,
      runValidators: true,
    };
    const rating = await Rating.findById(req.params.ratingID);
    if (!rating) {
      return res.status(404).json({
        message: "Rating not found",
      });
    }
    if (
      req.user.id.toString() !== rating.reviewer.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden",
        body: [],
      });
    }
    const newRating = await Rating.findByIdAndUpdate(
      req.params.ratingID,
      { $set: req.body },
      options,
    );

    return res.status(200).json({
      message: "Successfully updated rating",
      body: newRating,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function deleteAllRating(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    await Rating.deleteMany({});

    return res.status(200).json({
      message: "Successfully deleted all rating",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function deleteRating(req, res) {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    if (
      req.user.role !== "admin" &&
      req.user.id.toString() !== rating.reviewer.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    await Rating.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      message: "Successfully deleted rating",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}
