const Adopter = require("../models/Adopter");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "6734110788-rn5ibmvbnn7tf00hmr0lihi6ph9ma1fs.apps.googleusercontent.com";

const authGoogle = async (req, res) => {
  try {
    const client = new OAuth2Client(CLIENT_ID);
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token.idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const user = await Adopter.findOne({ googleId: payload.sub });
    console.log(user);
    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    } else {
      const jwttoken = jwt.sign(
        {
          id: user._id,
          role: user.userType,
        },
        process.env.JWT_SECRET
      );

      return res.status(200).json({
        message: "User Found",
        token: jwttoken,
        body: user,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

module.exports = authGoogle;
