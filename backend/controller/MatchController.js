import Match from "../models/Match.js";

export async function findUserMatchedPet(req, res) {
  try {
    const { lastCursorID, lastCursorScore, limit } = req.query;
    let paginationQuery = {};
    if (lastCursorID && lastCursorScore) {
      paginationQuery = {
        $or: [
          { score: { $lt: lastCursorScore } },

          { score: lastCursorScore, _id: { $lt: lastCursorID } },
        ],
      };
    }

    const matchList = await Match.find({
      adopterID: req.user.id,
      ...paginationQuery,
      score: { $gte: 50 },
    })
      .sort({ score: -1, _id: -1 })
      .limit(limit)
      .populate("petID");

    if (matchList.length === 0) {
      return res.status(200).json({
        message: "No more matches",
        body: [],
      });
    }
    return res.status(200).json({
      message: "Successful Matching query",
      body: matchList,
    });
  } catch (err) {
    console.log("Paginated Pets Error");
    return res.status(500).json({
      message: "Server Error in Match Controller",
    });
  }
}
