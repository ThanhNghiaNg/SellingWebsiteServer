const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator/check");

exports.getAuthenticated = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.send({ isLoggedIn: false });
  } else {
    return res.send({ isLoggedIn: true, isAdmin: req.session.user.role === "admin" });
  }
};

exports.postLogin = (req, res, next) => {
  const { email, password, role } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({ message: errors.array()[0].msg });
  }
  User.findOne({ email })
    .then((user) => {
      return bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          if (role.includes(user.role)) {
            return res.send({
              message: "Succeffly Login!",
              token: user._id,
              name: user.fullName,
              role: user.role,
            });
          } else {
            return res.status(403).send({ message: "Unauthorized!" });
          }
        } else {
          return res.status(422).send({ message: "Password is incorrect!" });
        }
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.postSignup = (req, res, next) => {
  const { email, password, fullName, phone } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({ message: errors.array()[0].msg });
  }
  bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      const newUser = new User({
        email,
        fullName,
        password: hashPassword,
        phone,
        role: "customer",
        cart: { items: [], totalPrice: 0 },
        isActive: true,
      });
      return newUser.save().then((user) => {
        return res.status(201).send({ message: "Sign-up Successfully!" });
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.postLogout = (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(403).send({ message: "Failed to logout!" });
      } else {
        return res.send({ message: "Logout Successfully!" });
      }
    });
  }
};
