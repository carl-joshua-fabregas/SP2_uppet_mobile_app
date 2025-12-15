const Adopter = require("../models/Adopter");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "6734110788-rn5ibmvbnn7tf00hmr0lihi6ph9ma1fs.apps.googleusercontent.com";

const authGoogle = async (req, res) => {
  try {
    const client = new OAuth2Client(CLIENT_ID);
    const { token } = req.body;
    let newUser = false;

    const ticket = await client.verifyIdToken({
      idToken: token.idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    let user = await Adopter.findOne({ googleId: payload.sub });

    if (!user) {
      newUser = true;
      const adopter = new Adopter({
        firstName: "user",
        middleName: "user",
        lastName: "user",
        bio: "user",
        age: 0,
        occupation: "user",
        income: 0,
        address: "user",
        contactInfo: "user",
        livingCon: "user",
        lifeStyle: "user",
        householdMem: 0,
        currentOwnedPets: 0,
        hobies: "user",
        googleId: payload.sub,
        gender: "other",
      });
      console.log("EVERYTHINH ID FINE-1");

      const savedUser = await adopter.save();
      user = savedUser;
      console.log("EVERYTHINH ID FINE0");
    }
    console.log("EVERYTHINH ID FINE1");

    const jwttoken = jwt.sign(
      {
        id: user._id,
        role: user.userType,
      },
      process.env.JWT_SECRET
    );
    console.log("EVERYTHINH ID FINE2");
    return res.status(200).json({
      message: "User Found",
      token: jwttoken,
      body: user,
      status: newUser ? "new_user" : "old_user",
    });
  } catch (err) {
    console.log("EVERYTHINH IS NOT FINE");
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

module.exports = authGoogle;
