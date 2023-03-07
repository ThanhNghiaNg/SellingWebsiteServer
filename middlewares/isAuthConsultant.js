module.exports = (req, res, next) => {
  if (
    !req.session.isLoggedIn ||
    (req.session.user.role !== "admin" &&
      req.session.user.role !== "consultant")
  ) {
    return res.status(401).send({ message: "Access Denied!" });
  }
  next();
};
