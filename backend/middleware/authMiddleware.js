const jwt = require("jsonwebtoken");

const authMiddleWare = async (req, res, next) => {
  // console.log(req.headers);
  if (!req.headers.authorization) {
    return res.status(500).json({
      message: "Authorization Error",
    });
  }

  try {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    console.log(req.user);
  } catch (err) {
    console.log("HE THREW AN ERROR");
    return res.status(401).json({
      message: "Server Error Not authorized",
      body: err.body,
    });
  }

  next();
};

module.exports = authMiddleWare;
