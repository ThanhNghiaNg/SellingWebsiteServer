module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn || req.session.user.role !== "admin") {
    return res.status(401).send({ message: "Access Denied!" });
  }
  next();
};
