const express = require("express");
const shopController = require("../controllers/shop");
const productController = require("../controllers/product");
const userController = require("../controllers/user");
const sessionController = require('../controllers/session')
const isAuth = require("../middlewares/isAuthUser");
const { body } = require("express-validator/check");
const route = express.Router();

route.get("/images-home", shopController.getImagesOverall);

route.get("/products-home", shopController.getProductsOverall);

route.get("/products", productController.getProducts);

route.get("/search-products", productController.searchProducts);

route.get("/product/:id", productController.getProduct);

route.get("/product-related/:id", productController.getProductRelated);

route.post("/add-product-cart", isAuth, shopController.addProductToCart);

route.get("/cart", isAuth, shopController.getCart);

route.post(
  "/update-quantity-product-cart",
  isAuth,
  shopController.updateQuantityProductCart
);

route.delete(
  "/delete-product-cart/:id",
  isAuth,
  shopController.deleteProductCart
);

route.post(
  "/order",
  [
    body("email", "Invalid Email!").isEmail(),
    body("fullName", "Name must have at least 3 characters").isLength({
      min: 3,
    }),
    body("phone", "Phone must not be empty!").isLength({ min: 1 }),
    body("phone", "Phone must be numeric only!").isNumeric(),
    body("address", "Address must not be empty").isLength({ min: 1 }),
  ],
  isAuth,
  shopController.placeOrder
);

route.get("/history", isAuth, shopController.getOrderHistory);

route.get("/order/:id", isAuth, shopController.getOrder);

route.post("/room", isAuth, sessionController.createRoomChat);

route.get("/room/:id", isAuth, sessionController.getRoom);

route.patch("/room/:id", isAuth, sessionController.pushMessage);

module.exports = route;
