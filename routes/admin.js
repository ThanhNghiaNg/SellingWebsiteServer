const express = require("express");
const adminController = require("../controllers/admin");
const productController = require("../controllers/product");
const sessionController = require("../controllers/session");
const userController = require("../controllers/user");

const isAuthAdmin = require("../middlewares/isAuthAdmin");
const isAuthConsultant = require("../middlewares/isAuthConsultant");
const { body } = require("express-validator/check");
const route = express.Router();

route.get("/dashboard", isAuthAdmin, adminController.getDashBoard);

// CREATE PRODUCT
route.post(
  "/product",
  [
    body("name", "Product Name must not be empty!").isLength({ min: 1 }),
    body("category", "Category must not be empty!").isLength({ min: 1 }),
    body("shortDesc", "Short Description must not be empty!").isLength({
      min: 1,
    }),
    body("longDesc", "Long Description must not be empty!").isLength({
      min: 1,
    }),
    body("price", "Invalid Price!").isNumeric(),
    body("quantity", "Invalid Quantity!").isNumeric(),
  ],
  isAuthAdmin,
  productController.createProduct
);

// GET PRODUCT
route.get("/product/:id", isAuthAdmin, productController.getProduct);

// UPDATE PRODUCT
route.put(
  "/product/:id",
  [
    body("name", "Product Name must not be empty!").isLength({ min: 1 }),
    body("category", "Category must not be empty!").isLength({ min: 1 }),
    body("shortDesc", "Short Description must not be empty!").isLength({
      min: 1,
    }),
    body("longDesc", "Long Description must not be empty!").isLength({
      min: 1,
    }),
    body("price", "Invalid Price!").isNumeric(),
    body("quantity", "Invalid Quantity!").isNumeric(),
  ],
  isAuthAdmin,
  productController.updateProduct
);

// DELETE PRODUCT
route.delete("/product/:id", isAuthAdmin, productController.deleteProduct);

route.get("/rooms", isAuthConsultant, sessionController.getRooms);

route.get("/room/:id", isAuthConsultant, sessionController.getRoomAdmin);

route.patch("/room/:id", isAuthConsultant, sessionController.pushMessageAdmin);

route.get("/users", isAuthAdmin, userController.getAllUser);

route.delete("/user/:id", isAuthAdmin, userController.deleteUser);

module.exports = route;
