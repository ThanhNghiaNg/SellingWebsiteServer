const Product = require("../models/Product");
const { validationResult } = require("express-validator/check");
const { getPagingResult } = require("../utils/global");
exports.getProducts = (req, res, next) => {
  Product.find().then((products) => {
    return res.send(products);
  });
};

exports.searchProducts = (req, res, next) => {
  const searchValue = req.query.query;
  const page = req.query.page ? req.query.page : 1;
  const pageSize = req.query.pageSize ? req.query.pageSize : 5;
  Product.find({ name: { $regex: searchValue, $options: "i" } }).then(
    (products) => {
      return res.send(getPagingResult(products, page, pageSize));
    }
  );
};

exports.getProduct = (req, res, next) => {
  const id = req.params.id;
  Product.findById(id).then((product) => {
    return res.send(product);
  });
};

exports.getProductRelated = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    const allProducts = await Product.find();
    const relatedProducts = allProducts.filter(
      (prod) => prod.category === product.category && prod._id.toString() !== id
    );
    return res.send(relatedProducts);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

exports.createProduct = (req, res, next) => {
  const { name, category, shortDesc, longDesc, price, quantity } = req.body;
  const images = req.files;
  const imgPaths = images.map(
    (image) => `${req.protocol}://${req.get("host")}/${image.path}`
  );
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({ message: errors.array()[0].msg });
  }
  if (imgPaths.length != 4) {
    return res.status(422).send({ message: "Please Select 4 Images!" });
  }
  const newProduct = new Product({
    category,
    long_desc: longDesc,
    short_desc: shortDesc,
    name,
    price,
    quantity,
    ...imgPaths.reduce((acc, path, i) => {
      return { ...acc, [`img${i + 1}`]: path };
    }, {}),
  });
  newProduct.save().then((result) => {
    return res.send({ message: "Created Product!" });
  });
};

exports.getProduct = (req, res, next) => {
  const id = req.params.id;
  Product.findById(id).then((product) => {
    return res.send(product);
  });
};

exports.updateProduct = (req, res, next) => {
  const id = req.params.id;
  const { name, category, shortDesc, longDesc, price, quantity } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({ message: errors.array()[0].msg });
  }
  Product.findById(id).then((product) => {
    product.name = name;
    product.category = category;
    product.long_desc = longDesc;
    product.short_desc = shortDesc;
    product.price = price;
    product.quantity = quantity;

    return product.save().then(() => {
      return res.send({ message: "Updated product!" });
    });
  });
};

exports.deleteProduct = (req, res, next) => {
  const id = req.params.id;
  Product.findByIdAndDelete(id).then((result) => {
    return res.send({ message: "Deleted Product!" });
  });
};
