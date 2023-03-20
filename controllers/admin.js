const Order = require("../models/Order");
const Product = require("../models/Product");

exports.getDashBoard = (req, res, next) => {
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );
  const endOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    1
  );
  Order.find({ createAt: { $gte: startOfMonth, $lt: endOfMonth } })
    .sort({ createAt: -1 })
    .then((orders) => {
      const numberUniqueClients = new Set(
        orders.map((order) => order.user.email)
      ).size;
      const earning = orders.reduce((acc, order) => {
        return acc + order._doc.totalPrice;
      }, 0);

      return res.send({
        info: {
          clients: numberUniqueClients,
          monthEarning: earning,
          numOrders: orders.length,
        },
        orders: orders.slice(0, 10),
      });
    });
};
