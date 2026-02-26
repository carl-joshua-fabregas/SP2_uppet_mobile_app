import Rating from "../models/Rating.js";

export async function createRating (req, res) {
  try {
    const { ratedUser, score, reviewer, body } = req.body;

    const rating = new Rating({
      ratedUser: ratedUser,
      score: score,
      reviewer: reviewer,
      body: body,
    });

    const status = await rating.save();

    return res.status(200).json({
      message: "Successfully made Rating",
      body: status,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function findAllRating (req, res) {
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
};

export async function findRatingsOfUser (req, res) {
  try {
    const notification = await Rating.find({ ratedUser: req.user.id });
    if (notification.length == 0) {
      return res.status(404).json({
        message: "Nothing Found",
      });
    }
    return res.status(200).json({
      message: "Successfully found all ratings",
      body: notification,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function findAllRatedUser (req, res) {
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
};

export async function updateRating (req, res) {
  try {
    const options = {
      new: true,
      runValidators: true,
    };
    const rating = await Rating.findById(req.params.id);
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
      });
    }
    const newRating = await Rating.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      options
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
};

export async function deleteAllRating (req, res) {
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
};

export async function deleteRating (req, res) {
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
};
