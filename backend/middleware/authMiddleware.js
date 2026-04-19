import jwt from "jsonwebtoken";

export default async function authMiddleWare(req, res, next) {
  console.log(`====================${req.path}=================`);
  if (req.path === `/api/user/post`) {
    return next();
  }
  if (!req.headers.authorization) {
    console.log("---------------------NO HEADERS---------------------------");
    return res.status(500).json({
      message: "Authorization Error",
    });
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    console.log(
      "User in middke ware is",
      req.user,
      "token is: ",
      token,
      "decoded is",
      decoded,
    );
  } catch (err) {
    console.log(
      "----------------------------HE THREW AN ERROR---------------------------",
    );
    return res.status(401).json({
      message: "Server Error Not authorized",
      body: err.body,
    });
  }

  next();
}
