const Rating = require("../models/Rating");

const createRating = async (req, res) => {
	try {
		const { ratedUser, score, reviewer, body, timestamp } = req.body;

		const rating = new Rating({
			ratedUser: ratedUser,
			score: score,
			reviewer: reviewer,
			body: body,
			timestamp: timestamp,
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

const findAllRating = async (req, res) => {
	try {
		const notification = await Rating.find({});

		if (!notification) {
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

const findAllUserRating = async (req, res) => {
    try {
        const notification = await find({ratedUser:req.user.id})
        if(!notification){
            return res.status(404).json({
                message: "Nothing Found"
            })
        }
        return res.status(200).json({
            message: "Successfully found all ratings",
            body: notification
        })
    }
}
module.exports = {};
