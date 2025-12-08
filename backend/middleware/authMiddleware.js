const mockMidWare = (req, res, next) => {
  req.user = {
    role: "admin",
    id: "23",
  };
  next();
};

module.exports = mockMidWare;
