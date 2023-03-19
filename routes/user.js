const express = require("express");
const isAuth = require("../middlewares/isAuthUser");
const userController = require("../controllers/user");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { body } = require("express-validator/check");

const route = express.Router();

route.get("/user", isAuth, userController.getUserInfomation);

route.put("/user", isAuth, userController.updateInformtaion);

route.patch(
  "/user/password",
  isAuth,
  [
    body("oldPassword").custom(async (value, { req }) => {
      const user = await User.findById(req.session.user._id);
      const doMatched = await bcrypt.compare(value, user.password);
      if (!doMatched) {
        return Promise.reject("Old password is not correct!");
      }
    }),
    body(
      "newPassword",
      "Password must not be less than 5 characters!"
    ).isLength({ min: 5 }),
    body("newPassword").custom((value, { req }) => {
      if (req.body.confirmPassword !== value) {
        throw "New Password and Confirm Password must be the same!";
      } else {
        return true;
      }
    }),
  ],
  userController.updatePassword
);

module.exports = route;
