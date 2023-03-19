const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator/check");
const { getPagingResult } = require("../utils/global");

exports.getAllUser = async (req, res, next) => {
  try {
    const page = req.query.page ? req.query.page : 1;
    const pageSize = req.query.pageSize ? req.query.pageSize : 5;
    const users = await User.find();
    const usersInfos = users.map((user) => {
      const { password, cart, ...userInfo } = user._doc;
      return userInfo;
    });
    return res.send(getPagingResult(usersInfos, page, pageSize));
  } catch (err) {
    console.log(err);
  }
};

exports.getUserInfomation = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id);
    const { password, ...userinfo } = user._doc;
    return res.send(userinfo);
  } catch (err) {
    return res.status(500).send({ message: "Failed to get!" });
  }
};

exports.updateInformtaion = async (req, res, next) => {
  try {
    const { email, fullName, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(req.session.user._id, {
      ...req.body,
    });
    return res.send({ message: "Information Updated!" });
  } catch (err) {
    return res.status(500).send({ message: "Failed to update!" });
  }
};

exports.updatePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({ message: errors.array()[0].msg });
  }
  try {
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 12);
    await User.findByIdAndUpdate(req.session.user._id, {
      $set: { password: hashedPassword },
    });
    return res.send({ message: "Password Changed!" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Failed to change password!" });
  }
};
