const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const { validationResult } = require("express-validator/check");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { generateOrderMail, getPagingResult } = require("../utils/global");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nguoidung9994@gmail.com",
    pass: "frxzcuisybomkeoc",
  },
});

exports.getImagesOverall = (req, res, next) => {
  const imgOverallPath = "images/overall";
  const bannerPath = `${req.protocol}://${req.get(
    "host"
  )}/${imgOverallPath}/banner1.jpg`;
  const categoriesPaths = [];
  for (let i = 1; i <= 5; i++) {
    categoriesPaths.push(
      `${req.protocol}://${req.get("host")}/${imgOverallPath}/product_${i}.png`
    );
  }
  return res.send({ bannerPath, categoriesPaths });
};

exports.getProductsOverall = (req, res, next) => {
  const numberOfProducts = Number(req.query.numberOfProducts) || 8;
  Product.find().then((products) => {
    res.send(products.slice(0, numberOfProducts));
  });
};

exports.addProductToCart = (req, res, next) => {
  const { product, quantity } = req.body;
  User.findById(req.session.user._id).then((user) => {
    return user.addProductToCart(product, quantity).then((result) => {
      return res.send({ messahe: "Added Product to Cart." });
    });
  });
};

exports.getCart = (req, res, next) => {
  User.findById(req.session.user._id)
    .populate("cart.items.productId")
    .then((user) => {
      return res.send(user.cart);
    });
};

exports.updateQuantityProductCart = (req, res, next) => {
  const { product, quantity } = req.body;
  User.findById(req.session.user._id).then((user) => {
    return user.updateProductCart(product, quantity).then((result) => {
      return res.send({ messahe: "Updated Product Cart." });
    });
  });
};

exports.deleteProductCart = (req, res, next) => {
  const id = req.params.id;
  User.findById(req.session.user._id).then((user) => {
    return user.deleteProductCart(id).then((result) => {
      return res.send({ messahe: "Deleted Product from Cart." });
    });
  });
};

exports.placeOrder = (req, res, next) => {
  const { fullName, email, phone, address, totalPrice } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({ message: errors.array()[0].msg });
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (user.cart.items.length === 0) {
        return res
          .status(400)
          .send({ message: "There is no item in your cart!" });
      }
      const newOrder = new Order({
        items: [...user.cart.items],
        totalPrice,
        createAt: new Date(),
        user: {
          userId: user._id,
          fullName,
          email,
          phone,
          address,
        },
        delivery: "progressing",
        status: "paying",
      });
      return newOrder.save().then((result) => {
        const productInfo = [];
        Promise.all(
          result.items.map((item) =>
            Product.findById(item.productId).then((product) => {
              product.quantity -= item.quantity;
              productInfo.push({
                name: product.name,
                img: product.img1,
                price: product.price,
                quantity: item.quantity,
                totalPrice: item.quantity * product.price,
              });
              return product.save();
            })
          )
        ).then(() => {
          transporter.sendMail(
            {
              from: "nguoidung9994@gmail.com",
              to: user.email,
              subject: "Successfully Order",
              html: generateOrderMail(
                newOrder.user,
                productInfo,
                newOrder.totalPrice
              ),
            },
            (error, info) => {
              if (error) {
                console.error(error);
              } else {
                console.log("Email sent: " + info.response);
              }
            }
          );
          return user.resetCart().then(() => {
            return res.send({ message: "Created Order!" });
          });
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrderHistory = (req, res, next) => {
  const page = req.query.page ? req.query.page : 1;
  const pageSize = req.query.pageSize ? req.query.pageSize : 5;
  Order.find({ "user.userId": req.user._id })
    .sort({ createAt: -1 })
    .then((orders) => {
      return res.send(getPagingResult(orders, page, pageSize));
    });
};

exports.getOrder = (req, res, next) => {
  const id = req.params.id;
  Order.find({ "user.userId": req.user._id, _id: id })
    .populate("items.productId")
    .then((orders) => {
      if (!orders[0]) {
        return res.status(400).send({
          message: "Wrong Order ID or User do not have right to access",
        });
      }
      return res.send(orders[0]);
    });
};
