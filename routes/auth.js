const express = require("express");
const route = express.Router();
const authController = require("../controllers/auth");
const User = require("../models/User");
const { check, body } = require("express-validator/check");
const isAuth = require("../middlewares/isAuthUser");

route.get("/authenticated", authController.getAuthenticated);

route.post(
  "/login",
  [
    body("email", "Invalid Email!")
      .isEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (!user) {
            throw "User is not Signed up!";
          } else if (!user.isActive) {
            throw "User account is blocked!";
          }
        });
      }),
    body(
      "password",
      "Password must not contain special characters and have at least 5 characters!"
    )
      .isAlphanumeric()
      .isLength({ min: 5 }),
  ],
  authController.postLogin
);
route.post(
  "/sign-up",
  [
    body("email", "Invalid Email!").isEmail(),
    body("email").custom((value, { req }) => {
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          throw new Error("Email is already signed up!");
        }
      });
    }),
    body("fullName", "Name must have at least 3 characters").isLength({
      min: 3,
    }),
    body(
      "password",
      "Password must not contain special characters and have at least 5 characters!"
    )
      .isAlphanumeric()
      .isLength({ min: 5 }),
    body("phone", "Phone must not be empty!").isLength({ min: 1 }),
    body("phone", "Phone must be numeric only!").isNumeric(),
  ],
  authController.postSignup
);

route.post("/logout", isAuth, authController.postLogout);

module.exports = route;
