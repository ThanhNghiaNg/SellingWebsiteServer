const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  items: [
    {
      productId: { type: Schema.Types.ObjectId, require: true, ref: "Product" },
      quantity: { type: Number, require: true },
    },
  ],
  totalPrice: { type: Number, require: true },
  createAt: { type: Date, require: true },
  user: {
    userId: { type: Schema.Types.ObjectId, require: true, ref: "User" },
    fullName: { type: String, require: true },
    email: { type: String, require: true },
    phone: { type: String, require: true },
    address: { type: String, require: true },
  },
  delivery: { type: String, require: true },
  status: { type: String, require: true },
});

module.exports = mongoose.model("Order", orderSchema);
